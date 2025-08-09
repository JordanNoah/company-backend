import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyEntity from "@/domain/entity/company.entity";

export default abstract class CompanyRepository {
    public abstract upsertCompany(company: CompanyDto): Promise<CompanyEntity>;
    public abstract findByDto(company: CompanyDto): Promise<CompanyEntity | null>;
}