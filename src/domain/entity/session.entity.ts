import { SessionSequelize } from "@/infrastructure/database/model/session";
import { SessionContext } from "@/shared/type";

export class SessionEntity {
    constructor(
        public id: number,
        public context: SessionContext,
        public contextId: number | null,
        public refreshHash: Buffer,
        public familyId: string,
        public userAgent: string | null,
        public ip: string | null,
        public expiresAt: Date,
        public revokedAt: Date | null,
        public replacedBy: number | null,
        public createdAt: Date,
        public updatedAt: Date
    ){}

    static fromRow(row: SessionSequelize): SessionEntity {
        return new SessionEntity(
            row.id,
            row.context,
            row.contextId,
            row.refreshHash,
            row.familyId,
            row.userAgent,
            row.ip,
            row.expiresAt,
            row.revokedAt,
            row.replacedBy,
            row.createdAt,
            row.updatedAt
        );
    }
}