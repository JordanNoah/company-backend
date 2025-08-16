import {
  SessionEntity,
} from '@/domain/entity/session.entity';
import SessionDto from '@/domain/dto/session.dto';
import { RefreshStatus, SessionContext } from '@/shared/type';
import { RotateSessionEntity } from '../entity/rotateSession.entity';


export default abstract class SessionRepository {
  abstract create(input: SessionDto): Promise<{ session: SessionEntity; refreshToken: string }>;
  abstract validateRefresh(refreshToken: string): Promise<{ status: RefreshStatus; session?: SessionEntity }>;
  abstract rotate(refreshToken: string,opts?: { userAgent?: string | null; ip?: string | null; ttlMs?: number }): Promise<RotateSessionEntity>;
  abstract revokeByRefresh(refreshToken: string): Promise<void>;
  abstract revokeById(sessionId: string): Promise<void>;
  abstract revokeFamily(familyId: string): Promise<number>;
  abstract listActiveByUser(userId: number): Promise<SessionEntity[]>;
  abstract touch(sessionId: string, meta?: { userAgent?: string | null; ip?: string | null }): Promise<void>;
  abstract purgeExpired(now?: Date): Promise<number>;
  abstract enforceLimitByContext(context: SessionContext, contextId: number | null, maxSessions: number): Promise<number>
  abstract newRefreshToken(): string;
  abstract hashRefresh(token: string): Buffer;
}
