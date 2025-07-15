export interface DriverResponse {
    reference: string;
    username: string;
    email: string;
    fullName: string;
    status: DriverStatus;
    role: DriverRole;
    active: boolean;
    zones?: string;
}

type DriverStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_BREAK' | 'ON_MISSION';

type DriverRole = 'DRIVER';
