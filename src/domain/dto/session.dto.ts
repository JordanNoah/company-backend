import { SessionContext } from "@/shared/type";

export default class SessionDto {
  constructor(
    public context: SessionContext,     // 'user' | 'company' | 'system'
    public contextId?: number | null,     // para 'system' puede ser null
    public userAgent?: string | null,
    public ip?: string | null,
    public ttlMs?: number,
    public familyId?: string
  ) {}

  static create(object: { [key: string]: any }): SessionDto {
    return new SessionDto(
      object.userId,
      object.context,
      object.userAgent,
      object.ip,
      object.ttlMs,
      object.familyId
    );
  }
}