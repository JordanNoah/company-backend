import { CompanySequelize } from "./model/company"

export const DbSequelize = async () => {
    await CompanySequelize.sync();
}