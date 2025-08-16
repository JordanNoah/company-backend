import {
  SessionEntity,
} from '@/domain/entity/session.entity';
import SessionDto from '@/domain/dto/session.dto';
import { RefreshStatus, SessionContext } from '@/shared/type';
import { RotateSessionEntity } from '../entity/rotateSession.entity';


export default abstract class SessionDatasource {
    
  /**
   * Crea una sesión nueva y devuelve el refresh token (en claro) una sola vez.
   * Debe guardar SOLO el hash en DB.
   */
  abstract create(input: SessionDto): Promise<{ session: SessionEntity; refreshToken: string }>;

  /**
   * Valida un refresh token y reporta su estado sin mutar nada.
   * Útil para auditoría o flujos custom.
   */
  abstract validateRefresh(refreshToken: string): Promise<{ status: RefreshStatus; session?: SessionEntity }>;

  /**
   * Rota el refresh token de forma ATÓMICA:
   * - crea nueva sesión (misma familyId)
   * - marca la anterior como revocada + replacedBy
   * - devuelve nuevo refresh (en claro) y access lo firmas fuera
   */
  abstract rotate(
    refreshToken: string,
    opts?: { userAgent?: string | null; ip?: string | null; ttlMs?: number }
  ): Promise<RotateSessionEntity>;

  /** Revoca una sesión por su refresh (hash interno). */
  abstract revokeByRefresh(refreshToken: string): Promise<void>;

  /** Revoca una sesión por id. */
  abstract revokeById(sessionId: string): Promise<void>;

  /**
   * Revoca TODA la familia (todas las rotaciones encadenadas).
   * Útil ante reuso/robo de token.
   * Devuelve cuántas filas afectó.
   */
  abstract revokeFamily(familyId: string): Promise<number>;

  /** Lista sesiones activas de un usuario (no revocadas y no expiradas). */
  abstract listActiveByUser(userId: number): Promise<SessionEntity[]>;

  /** Actualiza metadatos de uso (last seen) o UA/IP si te interesa registrarlo. */
  abstract touch(sessionId: string, meta?: { userAgent?: string | null; ip?: string | null }): Promise<void>;

  /** Borra expiradas (mantenimiento); devuelve cuántas eliminó. */
  abstract purgeExpired(now?: Date): Promise<number>;

  /**
   * Enforce de límite de sesiones por usuario (p.ej. 5).
   * Revoca las más antiguas si se excede. Devuelve cuántas revocó.
   */
  abstract enforceLimitByContext(context: SessionContext, contextId: number | null, maxSessions: number): Promise<number>

  abstract newRefreshToken(): string;

  abstract hashRefresh(token: string): Buffer;
}
