import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';


import { CustomError } from '@/shared/custom.error';
import SessionRepositoryImpl from '@/infrastructure/repository/session.respository.impl';
import { SessionDatasourceImpl } from '@/infrastructure/datasource/session.datasource.impl';
import env from '@/shared/env';

const REFRESH_COOKIE_PATH = '/auth';

export default class AuthController {
  constructor(
    private readonly sessionRepositoryImpl = new SessionRepositoryImpl(
      new SessionDatasourceImpl()
    )
  ) { }

  public refreshToken = async (c: Context) => {
    try {
      // 1) Cookie
      const refresh = getCookie(c, 'rt');
      if (!refresh) return c.json({ error: 'No refresh token' }, 401);

      const ua = c.req.header('user-agent') ?? null;
      const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

      const { newSession, refreshToken: newRefresh } =
        await this.sessionRepositoryImpl.rotate(refresh, { userAgent: ua, ip });

      // 2) Firmar access JWT (HS256)
      const secret = env.JWT_SECRET;

      if (!secret || typeof secret !== 'string') {
        console.error('JWT_SECRET no configurado');
        return c.json({ error: 'Server misconfigured (JWT secret)' }, 500);
      }

      const exp = Math.floor(Date.now() / 1000) + env.ACCESS_TTL_MIN * 60;
      const payload = {
        sub: String(newSession.contextId ?? 0),
        ctx: newSession.context,
        sid: newSession.id,
        exp,
      };

      // 👇 PASA el algoritmo explícitamente
      const accessToken = await sign(payload, secret, 'HS256');

      // 3) Rota cookie rt (usa el path correcto de tus rutas)
      setCookie(c, 'rt', newRefresh, {
        httpOnly: true,
        secure: false,                // en dev HTTP
        sameSite: 'Lax',
        path: env.REFRESH_COOKIE_PATH, // p.ej. '/api/v1/auth'
        maxAge: env.REFRESH_MAX_AGE,   // 2592000 (30d)
      });

      return c.json({ accessToken }, 200);
    } catch (err) {
      console.error(err);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  };


  // (Opcional) POST /auth/logout
  public logout = async (c: Context) => {
    try {
      // si quisieras revocar por refresh cookie:
      const refresh = getCookie(c, 'rt');
      if (refresh) {
        await this.sessionRepositoryImpl.revokeByRefresh(refresh);
      }
      // expira la cookie
      setCookie(c, 'rt', '', { path: REFRESH_COOKIE_PATH, maxAge: 0 });
      return c.body(null, 204);
    } catch (err) {
      if (err instanceof CustomError) {
        return c.json({ error: err.message }, 400);
      }
      console.error(err);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  };
}
