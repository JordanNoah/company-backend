export class CustomError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly message: string
    ) {
        super(message);
    }

    static badRequest(message: string) {
        return new CustomError(400, message)
    }

    static unauthorized(message: string) {
        return new CustomError(401, message)
    }

    static forbidden(message: string) {
        return new CustomError(403, message)
    }

    static notFound(message: string) {
        return new CustomError(404, message)
    }

    static internalServer(message: string = 'Internal error') {
        return new CustomError(500, message)
    }

    static transactionError(reason: string) {
        return new CustomError(500, `Transaction failed: ${reason}`);
    }

    static missingAttribute(attribute: string, from: string) {
        return new CustomError(400, `Missing attribute: ${attribute} from ${from}`);
    }

    static actionNotAllowed(message: string) {
        return new CustomError(405, message)
    }

    static resourceExists(message: string) {
        return new CustomError(409, message);
    }

}