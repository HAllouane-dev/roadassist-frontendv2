export interface ErrorValidationResponse {
    code: string;
    message: string;
    status: number;
    fieldsErrors: FieldsErrors[];
}

export interface ErrorResponse {
    code: string;
    message: string;
    status: number;
    error: string;
    path: string;
}

interface FieldsErrors {
    field: string;
    message: string;
}
