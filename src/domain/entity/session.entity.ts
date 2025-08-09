export class SessionEntity {
    constructor(
        public id: string,
        public userId: number,
        public familyId: string,
        public userAgent: string | null,
        public ip: string | null,
        public expiresAt: Date,
        public revokedAt: Date | null,
        public replacedBy: string | null,
        public createdAt: Date,
        public updatedAt: Date
    ){}
}