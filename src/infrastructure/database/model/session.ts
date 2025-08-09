import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/infrastructure/database/sequelize";

interface SessionRow {
    id: string;
    userId: number;
    refreshHash: Buffer;
    familyId: string;
    userAgent?: string | null;
    ip?: string | null;
    expiresAt: Date;
    revokedAt?: Date | null;
    replacedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class SessionSequelize extends Model<SessionRow, Omit<SessionRow, 'id'>> {
    declare id: string;
    declare userId: number;
    declare refreshHash: Buffer;
    declare familyId: string;
    declare userAgent?: string | null;
    declare ip?: string | null;
    declare expiresAt: Date;
    declare revokedAt?: Date | null;
    declare replacedBy?: string | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

SessionSequelize.init({
    id: { 
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
        autoIncrement: false
    },
    userId: {
        type: DataTypes.BIGINT, 
        allowNull: false 
    },
    refreshHash: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    familyId: {
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ip: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    replacedBy: {
        type: DataTypes.CHAR(36),
        allowNull: true
    },
}, {
    tableName: 'sessions',
    timestamps: true,
    underscored: true,
    sequelize: sequelize
})