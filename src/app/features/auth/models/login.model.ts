export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    userResponse: UserResponse;
}

export interface UserResponse {
    reference: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
}
