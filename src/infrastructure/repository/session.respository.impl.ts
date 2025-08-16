import SessionRepository from "@/domain/repository/session.respository";
import { SessionDatasourceImpl } from "../datasource/session.datasource.impl";
import SessionDto from "@/domain/dto/session.dto";
import { SessionEntity } from "@/domain/entity/session.entity";
import { RefreshStatus, SessionContext } from "@/shared/type";
import { RotateSessionEntity } from "@/domain/entity/rotateSession.entity";

export default class SessionRepositoryImpl implements SessionRepository {
    constructor(
        private readonly sessionDataSource: SessionDatasourceImpl
    ){}

    create(input: SessionDto): Promise<{ session: SessionEntity; refreshToken: string; }> {
        return this.sessionDataSource.create(input);
    }
    enforceLimitByContext(context: SessionContext, contextId: number | null, maxSessions: number): Promise<number> {
        return this.sessionDataSource.enforceLimitByContext(context, contextId, maxSessions);
    }
    hashRefresh(token: string): Buffer {
        return this.sessionDataSource.hashRefresh(token);
    }
    listActiveByUser(userId: number): Promise<SessionEntity[]> {
        return this.sessionDataSource.listActiveByUser(userId);
    }
    newRefreshToken(): string {
        return this.sessionDataSource.newRefreshToken();
    }
    purgeExpired(now?: Date): Promise<number> {
        return this.sessionDataSource.purgeExpired(now);
    }
    revokeById(sessionId: string): Promise<void> {
        return this.sessionDataSource.revokeById(sessionId);
    }
    revokeByRefresh(refreshToken: string): Promise<void> {
        return this.sessionDataSource.revokeByRefresh(refreshToken);
    }
    revokeFamily(familyId: string): Promise<number> {
        return this.sessionDataSource.revokeFamily(familyId);
    }
    rotate(refreshToken: string, opts?: { userAgent?: string | null; ip?: string | null; ttlMs?: number; }): Promise<RotateSessionEntity> {
        return this.sessionDataSource.rotate(refreshToken, opts);
    }
    touch(sessionId: string, meta?: { userAgent?: string | null; ip?: string | null; }): Promise<void> {
        return this.sessionDataSource.touch(sessionId, meta);
    }
    validateRefresh(refreshToken: string): Promise<{ status: RefreshStatus; session?: SessionEntity; }> {
        return this.sessionDataSource.validateRefresh(refreshToken);
    }

}
