import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyDataSourceImpl from "@/infrastructure/datasource/company.datasource.impl";
import CompanyRepositoryImpl from "@/infrastructure/repository/company.repository.impl";
import { Context } from "hono";

export default class CompanyController {
    private readonly companyRepositoryImpl = new  CompanyRepositoryImpl(
        new CompanyDataSourceImpl()
    );

    public async upsert(c: Context) {
        try {
            const [error, companyDto] = CompanyDto.fromJson(await c.req.json());
            if (error) return c.json({ error }, 400);
            return c.json(await this.companyRepositoryImpl.upsertCompany(companyDto!));
        } catch (error) {
            return c.json({ error },500);
        }
    }
}