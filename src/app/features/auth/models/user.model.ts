export interface User {
    reference: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'DRIVER';
