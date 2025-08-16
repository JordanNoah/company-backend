import CompanyDataSource from "@/domain/datasource/company.datasource";
import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyEntity from "@/domain/entity/company.entity";
import { CustomError } from "@/shared/custom.error";
import { CompanySequelize } from "../database/model/company";
import { hashPassword, verifyPassword } from "@/shared/function.shared";
import { Op } from "sequelize";

export default class CompanyDataSourceImpl implements CompanyDataSource {
    public async findByDto(company: CompanyDto): Promise<CompanyEntity | null> {
        try {
            const companyDb = await CompanySequelize.findOne({
                where: {
                    [Op.or]: [
                        { identificationNumber: company.identificationNumber },
                        { socialReason: company.socialReason },
                        { commercialName: company.commercialName },
                        { mobilePhone: company.mobilePhone },
                        { email: company.email }
                    ]
                }
            });
            return companyDb ? CompanyEntity.fromRow(companyDb) : null;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internalServer();
        }
    }
    public async createCompany(company: CompanyDto): Promise<CompanyEntity> {
        try {
            const companyDb = await CompanySequelize.create({
                identificationNumber: company.identificationNumber,
                socialReason: company.socialReason,
                commercialName: company.commercialName,
                mobilePhone: company.mobilePhone,
                email: company.email,
                passwordHash: await hashPassword(company.password)
            });
            return CompanyEntity.fromRow(companyDb);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internalServer();
        }
    }
    public async upsertCompany(company: CompanyDto): Promise<CompanyEntity> {
        try {
            const [companyDb, created] = await CompanySequelize.upsert({
                identificationNumber: company.identificationNumber,
                socialReason: company.socialReason,
                commercialName: company.commercialName,
                mobilePhone: company.mobilePhone,
                email: company.email,
                passwordHash: await hashPassword(company.password)
            });
            return CompanyEntity.fromRow(companyDb);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internalServer();
        }
    }
    public async findByEmailAndPassword(email: string, password: string): Promise<CompanyEntity | null> {
        try {
            const companyDb = await CompanySequelize.findOne({
                where: {
                    email: email
                }
            });

            if (!companyDb) return null;
            const isValid = await verifyPassword(companyDb.passwordHash, password);
            return isValid ? CompanyEntity.fromRow(companyDb) : null;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internalServer();
        }
    }
}