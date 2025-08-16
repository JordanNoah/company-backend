import { SessionEntity } from "./session.entity";

export class RotateSessionEntity {
    constructor(
        public oldSession: SessionEntity,
        public newSession: SessionEntity,
        public refreshToken: string,
    ){}
}