import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/infrastructure/database/sequelize";

interface CompanyRow {
    id: number;
    identificationNumber: string;
    socialReason: string;
    commercialName: string;
    mobilePhone: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class CompanySequelize extends Model<CompanyRow, Omit<CompanyRow, 'id'>> {
    declare id: number;
    declare identificationNumber: string;
    declare socialReason: string;
    declare commercialName: string;
    declare mobilePhone: string;
    declare email: string;
    declare passwordHash: string;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare deletedAt: Date | null;
}

CompanySequelize.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        identificationNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        socialReason: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        commercialName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        mobilePhone: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },{
        tableName: 'companies',
        timestamps: true,
        underscored: true,
        sequelize: sequelize,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ['identification_number']
            }
        ]
    }
);