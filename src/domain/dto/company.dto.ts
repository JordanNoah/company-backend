export class CompanyDto {
    constructor(
        public identificationNumber: string,
        public socialReason: string,
        public commercialName: string,
        public mobilePhone: string,
        public email: string,
        public password: string
    ){}

    public static fromJson(json: any): [string?,CompanyDto?] {
        if (!json.identificationNumber || !json.socialReason || !json.commercialName || !json.mobilePhone || !json.email || !json.password) {
            return ["Invalid input data"];
        }
        return [undefined, new CompanyDto(
            json.identificationNumber,
            json.socialReason,
            json.commercialName,
            json.mobilePhone,
            json.email,
            json.password
        )];
    }
}