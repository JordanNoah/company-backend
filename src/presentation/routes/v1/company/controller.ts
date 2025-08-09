import { CompanyDto } from "@/domain/dto/company.dto";
import CompanyDataSourceImpl from "@/infrastructure/datasource/company.datasource.impl";
import CompanyRepositoryImpl from "@/infrastructure/repository/company.repository.impl";
import { Context } from "hono";

export default class CompanyController {
    public readonly companyRepositoryImpl = new CompanyRepositoryImpl(
        new CompanyDataSourceImpl()
    );

    public upsert = async(c: Context) => {
        try {
            const [error, companyDto] = CompanyDto.fromJson(await c.req.json());
            if (error) return c.json({ error }, 400);
            const company = await this.companyRepositoryImpl.findByDto(companyDto!);
            if (company) return c.json(company, 200);
            return c.json(await this.companyRepositoryImpl.upsertCompany(companyDto!), 201);
        } catch (error) {
            console.log(error);
            
            return c.json({ error },500);
        }
    }
}