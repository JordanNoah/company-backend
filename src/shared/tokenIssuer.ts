import { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import env from '@/shared/env';
import SessionDto from '@/domain/dto/session.dto';
import { SessionDatasourceImpl } from '@/infrastructure/datasource/session.datasource.impl';

type CtxKind = 'company' | 'user' | 'system';

export class TokenIssuer {
  constructor(private readonly sessionDs = new SessionDatasourceImpl()) {}

  private getClientMeta(c: Context) {
    const userAgent = c.req.header('user-agent') ?? null;
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    return { userAgent, ip };
  }

  /** Crea sesión, rota refresh (cookie) y devuelve access + refresh (opcional para móvil). */
  public async issueFor(
    c: Context,
    subject: { ctx: CtxKind; id: number },
    opts?: { ttlMs?: number; includeRefreshInBody?: boolean; extraClaims?: Record<string, unknown> }
  ): Promise<{ accessToken: string; refreshToken?: string; sessionId: number; familyId: string }> {
    const { userAgent, ip } = this.getClientMeta(c);

    // 1) Crear sesión
    const sessionDto = new SessionDto(subject.ctx, subject.id, userAgent, ip);
    if (opts?.ttlMs) sessionDto.ttlMs = opts.ttlMs;

    const { session, refreshToken } = await this.sessionDs.create(sessionDto);

    // 2) Firmar access corto
    const exp = Math.floor(Date.now() / 1000) + env.ACCESS_TTL_MIN * 60;
    const payload = {
      sub: String(subject.id),
      ctx: subject.ctx,
      sid: session.id,
      familyId: session.familyId,
      ...(opts?.extraClaims ?? {}),
      exp,
    };
    const accessToken = await sign(payload, env.JWT_SECRET);

    // 3) Setear cookie del refresh
    setCookie(c, 'rt', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',                 // en móvil/local OK; en prod web usarías 'None' + HTTPS
      path: env.REFRESH_COOKIE_PATH,   // '/auth'
      maxAge: env.REFRESH_MAX_AGE,     // 30d
    });

    return {
      accessToken,
      refreshToken: opts?.includeRefreshInBody ? refreshToken : undefined, // móvil: puedes devolverlo si quieres
      sessionId: session.id,
      familyId: session.familyId,
    };
  }
}
