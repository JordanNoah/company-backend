import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/infrastructure/database/sequelize";
import { SessionContext } from "@/shared/type";

interface SessionRow {
    id: number;
    context: SessionContext;
    contextId: number | null;
    refreshHash: Buffer;
    familyId: string;
    userAgent: string | null;
    ip: string | null;
    expiresAt: Date;
    revokedAt: Date | null;
    replacedBy: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class SessionSequelize extends Model<SessionRow, Omit<SessionRow, 'id'>> {
    declare id: number;
    declare context: SessionContext;
    declare contextId: number | null;
    declare refreshHash: Buffer;
    declare familyId: string;
    declare userAgent: string | null;
    declare ip: string | null;
    declare expiresAt: Date;
    declare revokedAt: Date | null;
    declare replacedBy: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

SessionSequelize.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    context: { type: DataTypes.ENUM('user', 'company', 'system'), allowNull: false },
    contextId: { field: 'context_id', type: DataTypes.BIGINT, allowNull: true },
    refreshHash: { field: 'refresh_hash', type: DataTypes.BLOB('tiny') as any, allowNull: false }, // BINARY(32)
    familyId: { field: 'family_id', type: DataTypes.CHAR(36), allowNull: false },
    userAgent: { field: 'user_agent', type: DataTypes.STRING(255) },
    ip: { type: DataTypes.STRING(64) },
    expiresAt: { field: 'expires_at', type: DataTypes.DATE, allowNull: false },
    revokedAt: { field: 'revoked_at', type: DataTypes.DATE },
    replacedBy: { field: 'replaced_by', type: DataTypes.BIGINT },
}, {
    tableName: 'sessions',
    timestamps: true,
    underscored: true,
    sequelize: sequelize
})