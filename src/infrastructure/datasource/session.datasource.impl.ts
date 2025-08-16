import SessionDatasource from "@/domain/datasource/session.datasource";
import SessionDto from "@/domain/dto/session.dto";
import { RotateSessionEntity } from "@/domain/entity/rotateSession.entity";
import { SessionEntity } from "@/domain/entity/session.entity";
import { CustomError } from "@/shared/custom.error";
import env from "@/shared/env";
import { RefreshStatus, SessionContext } from "@/shared/type";
import { createHash, randomBytes, randomUUID } from "crypto";
import { SessionSequelize } from "../database/model/session";
import { Op } from "sequelize";
import { sequelize } from "../database/sequelize";

export class SessionDatasourceImpl implements SessionDatasource {
    async create(input: SessionDto): Promise<{ session: SessionEntity; refreshToken: string; }> {
        try {
            const refreshToken = this.newRefreshToken();
            const refreshHash = this.hashRefresh(refreshToken);

            const familyId = input.familyId ?? randomUUID();
            const expiresAt = new Date(Date.now() + (input.ttlMs ?? env.DEFAULT_TTL_MS));

            const row = await SessionSequelize.create({
                context: input.context,
                contextId: input.contextId ?? null,
                refreshHash,
                familyId,
                userAgent: input.userAgent ?? null,
                ip: input.ip ?? null,
                expiresAt,
            });

            const session = SessionEntity.fromRow(row);

            return { session, refreshToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    async enforceLimitByContext(context: SessionContext, contextId: number | null, maxSessions: number): Promise<number> {
        if (maxSessions <= 0) {
            const [affected] = await SessionSequelize.update(
                { revokedAt: new Date() },
                {
                    where: {
                        context,
                        contextId,
                        revokedAt: { [Op.is]: null },
                        expiresAt: { [Op.gt]: new Date() },
                    },
                }
            );
            return affected ?? 0;
        }

        return await sequelize.transaction(async (t) => {
            const active = await SessionSequelize.findAll({
                where: {
                    context,
                    contextId,
                    revokedAt: { [Op.is]: null },
                    expiresAt: { [Op.gt]: new Date() },
                },
                attributes: ['id'],
                order: [['createdAt', 'DESC']],
                lock: t.LOCK.UPDATE,
                transaction: t,
            });

            if (active.length <= maxSessions) return 0;

            const toRevoke = active.slice(maxSessions).map(r => r.id);
            const [affected] = await SessionSequelize.update(
                { revokedAt: new Date() },
                { where: { id: { [Op.in]: toRevoke } }, transaction: t }
            );
            return affected ?? 0;
        });
    }
    async listActiveByUser(userId: number): Promise<SessionEntity[]> {
        try {
            const rows = await SessionSequelize.findAll({
                where: {
                    context: 'user',
                    contextId: userId,
                    revokedAt: { [Op.is]: null },
                    expiresAt: { [Op.gt]: new Date() },
                },
                order: [['createdAt', 'DESC']],
            });

            return rows.map(row => SessionEntity.fromRow(row));
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer();
        }
    }
    async purgeExpired(now?: Date): Promise<number> {
        try {
            const BATCH = 1000;
            let total = 0;

            while (true) {
                const affected = await SessionSequelize.destroy({
                    where: { expiresAt: { [Op.lt]: now } },
                    limit: BATCH,
                });
                total += affected;
                if (affected < BATCH) break;
            }

            return total;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer();
        }
    }
    async revokeById(sessionId: string): Promise<void> {
        try {
            await SessionSequelize.update(
                { revokedAt: new Date() },
                {
                    where: {
                        id: sessionId,
                        revokedAt: { [Op.is]: null },   // solo si sigue activa
                    },
                }
            );
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    async revokeByRefresh(refreshToken: string): Promise<void> {
        try {
            const h = this.hashRefresh(refreshToken);

            await SessionSequelize.update(
                { revokedAt: new Date() },
                {
                    where: {
                        refreshHash: h,            // BINARY(32)
                        revokedAt: { [Op.is]: null }, // solo si sigue activa
                    },
                }
            );
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer();
        }
    }
    async revokeFamily(familyId: string): Promise<number> {
        try {
            const [affected] = await SessionSequelize.update(
                { revokedAt: new Date() },
                {
                    where: {
                        familyId,
                        revokedAt: { [Op.is]: null }, // solo las que siguen activas
                    },
                }
            );
            return affected ?? 0;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    async rotate(refreshToken: string, opts?: { userAgent?: string | null; ip?: string | null; ttlMs?: number; }): Promise<RotateSessionEntity> {
        try {
            const h = this.hashRefresh(refreshToken);

            return await sequelize.transaction(async (t) => {
                // 1) Bloquea la sesión actual por hash
                const row = await SessionSequelize.findOne({
                    where: { refreshHash: h },
                    lock: t.LOCK.UPDATE,
                    transaction: t,
                });
                if (!row) throw CustomError.unauthorized('Invalid refresh');

                // 2) Reuso o ya revocada → revoca toda la familia y falla
                if (row.replacedBy || row.revokedAt) {
                    await SessionSequelize.update(
                        { revokedAt: new Date() },
                        { where: { familyId: row.familyId, revokedAt: { [Op.is]: null } }, transaction: t }
                    );
                    throw CustomError.unauthorized('Refresh token reused');
                }

                // 3) Expirado
                if (row.expiresAt.getTime() <= Date.now()) {
                    throw CustomError.unauthorized('Refresh token expired');
                }

                const oldEntity = SessionEntity.fromRow(row);

                // 4) Genera nuevo refresh y crea nueva sesión (mismo contexto/familia)
                const newRefresh = this.newRefreshToken();
                const newHash = this.hashRefresh(newRefresh);

                const newRow = await SessionSequelize.create(
                    {
                        context: row.context,
                        contextId: row.contextId,
                        refreshHash: newHash,
                        familyId: row.familyId,
                        userAgent: opts?.userAgent ?? row.userAgent,
                        ip: opts?.ip ?? row.ip,
                        expiresAt: new Date(Date.now() + (opts?.ttlMs ?? env.DEFAULT_TTL_MS)),
                    },
                    { transaction: t }
                );

                // 5) Marca la antigua como revocada y enlaza replaced_by
                await row.update(
                    { revokedAt: new Date(), replacedBy: Number(newRow.id) },
                    { transaction: t }
                );

                return {
                    oldSession: oldEntity,
                    newSession: SessionEntity.fromRow(newRow),
                    refreshToken: newRefresh,
                };
            });
        } catch (error) {
            console.log(error);
            
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    async touch(sessionId: string, meta?: { userAgent?: string | null; ip?: string | null; }): Promise<void> {
        try {
            const patch: Record<string, any> = {};

            if (meta && 'userAgent' in meta) patch.userAgent = meta.userAgent ?? null;
            if (meta && 'ip' in meta) patch.ip = meta.ip ?? null;

            // Forzar bump de updatedAt aunque no cambie UA/IP
            patch.updatedAt = sequelize.fn('NOW');

            await SessionSequelize.update(patch, {
                where: {
                    id: sessionId,
                    revokedAt: { [Op.is]: null },
                    expiresAt: { [Op.gt]: new Date() },
                },
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    async validateRefresh(refreshToken: string): Promise<{ status: RefreshStatus; session?: SessionEntity; }> {
        try {
            const h = this.hashRefresh(refreshToken);
            const row = await SessionSequelize.findOne({ where: { refreshHash: h } });

            if (!row) return { status: 'NOT_FOUND' };
            if (row.replacedBy) return { status: 'REUSED', session: SessionEntity.fromRow(row) }; // ya rotado
            if (row.revokedAt) return { status: 'REVOKED', session: SessionEntity.fromRow(row) }; // anulado
            if (row.expiresAt.getTime() <= Date.now()) return { status: 'EXPIRED', session: SessionEntity.fromRow(row) };

            return { status: 'VALID', session: SessionEntity.fromRow(row) };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer()
        }
    }
    newRefreshToken(): string {
        return randomBytes(64).toString('base64url');
    }
    hashRefresh(token: string): Buffer {
        return createHash('sha256').update(token).digest();
    }
}