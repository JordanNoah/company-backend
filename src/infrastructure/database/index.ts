import { CompanySequelize } from "./model/company"
import { SessionSequelize } from "./model/session";

export const DbSequelize = async () => {
    await CompanySequelize.sync();
    await SessionSequelize.sync();
}