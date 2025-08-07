import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyEntity from "@/domain/entity/company.entity";
import CompanyRepository from "@/domain/repository/company.repository";
import CompanyDataSourceImpl from "../datasource/company.datasource.impl";

export default class CompanyRepositoryImpl implements CompanyRepository {
    constructor(
        private readonly companyDataSourceImpl: CompanyDataSourceImpl
    ){}
    public upsertCompany(company: CompanyDto): Promise<CompanyEntity> {
        return this.companyDataSourceImpl.upsertCompany(company);
    }
}