import { CompanySequelize } from "@/infrastructure/database/model/company";

export default class CompanyEntity {
    constructor(
        public id: number,
        public identificationNumber: string,
        public socialReason: string,
        public commercialName: string,
        public mobilePhone: string,
        public email: string,
        public passwordHash: string,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null
    ) {}

    public static fromRow(row: CompanySequelize): CompanyEntity {
        return new CompanyEntity(
            row.id,
            row.identificationNumber,
            row.socialReason,
            row.commercialName,
            row.mobilePhone,
            row.email,
            row.passwordHash,
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        );
    }
}