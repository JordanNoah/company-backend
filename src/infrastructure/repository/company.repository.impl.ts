import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyEntity from "@/domain/entity/company.entity";
import CompanyRepository from "@/domain/repository/company.repository";
import CompanyDataSourceImpl from "../datasource/company.datasource.impl";
import CompanyDataSource from "@/domain/datasource/company.datasource";

export default class CompanyRepositoryImpl implements CompanyRepository {
    constructor(
        private readonly companyDataSource: CompanyDataSourceImpl
    ){}
    
    async upsertCompany(company: CompanyDto): Promise<CompanyEntity> {
        return this.companyDataSource.upsertCompany(company);
    }
    public findByDto(company: CompanyDto): Promise<CompanyEntity | null> {
        return this.companyDataSource.findByDto(company);
    }
    public findByEmailAndPassword(email: string, password: string): Promise<CompanyEntity | null> {
        return this.companyDataSource.findByEmailAndPassword(email, password);
    }
}