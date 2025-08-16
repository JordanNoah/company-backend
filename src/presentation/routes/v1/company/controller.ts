import { Context } from 'hono';
import { CompanyDto } from '@/domain/dto/company.dto';
import CompanyDataSourceImpl from '@/infrastructure/datasource/company.datasource.impl';
import CompanyRepositoryImpl from '@/infrastructure/repository/company.repository.impl';
import { TokenIssuer } from '@/shared/tokenIssuer';

export default class CompanyController {
    public readonly companyRepositoryImpl = new CompanyRepositoryImpl(new CompanyDataSourceImpl());
    private readonly tokenIssuer = new TokenIssuer();

    public upsert = async (c: Context) => {
        try {
            const [error, companyDto] = CompanyDto.fromJson(await c.req.json());
            if (error) return c.json({ error }, 400);

            const existing = await this.companyRepositoryImpl.findByDto(companyDto!);
            if (existing) return c.json(existing, 200);

            const created = await this.companyRepositoryImpl.upsertCompany(companyDto!);

            const tokens = await this.tokenIssuer.issueFor(
                c,
                { ctx: 'company', id: created.id },
                { includeRefreshInBody: true }
            );

            return c.json(
                {
                    company: created,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
                201
            );
        } catch (error) {
            return c.json({ error }, 500);
        }
    };

    public login = async (c: Context) => {
        try {
            const { email, password } = await c.req.json();
            if (!email) return c.json({ error: 'Email is required' }, 400);
            if (!password) return c.json({ error: 'Password is required' }, 400);
            
            const company = await this.companyRepositoryImpl.findByEmailAndPassword(email, password);
            if (!company) return c.json({ error: 'Invalid email or password' }, 401);

            const tokens = await this.tokenIssuer.issueFor(
                c,
                { ctx: 'company', id: company.id },
                { includeRefreshInBody: true }
            );

            return c.json(
                {
                    company: company,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                },
                200
            );
        } catch (error) {
            return c.json({ error }, 500);
        }
    };
}
