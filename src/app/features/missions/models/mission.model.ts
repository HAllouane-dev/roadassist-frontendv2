export interface MissionResponse {
    id: string;
    providerReference: string;
    providerName: string;
    providerType: ProviderTypeEnum;
    missionType: MissionType[];
    MissionStatus: MissionStatusEnum;
    requesterName: string;
    requesterPhone: string;
    vehicleMake: string;
    vehicleModel: string;
    vehiclePlate: string;
    missionPriority: MissionPriorityEnum;
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    destinationAddress: string;
    destinationLatitude: number;
    destinationLongitude: number;
    receivedAt: string;
    createdAt: string;
    updatedAt: string;
    notes: string;
    missionStatusHistory: MissionStatusHistory[];
}

export interface MissionRequest {}

export interface MissionStatusFormatted {
    name: string;
    code: MissionStatusEnum;
}

export interface MissionPriorityFormatted {
    name: string;
    code: MissionPriorityEnum;
}
export interface MissionTypeFormatted {
    name: string;
    code: MissionTypeEnum;
}

export interface ProviderTypeFormatted {
    name: string;
    code: ProviderTypeEnum;
}

export type MissionStatusEnum = 'CREATED' | 'PRE_ASSIGNED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_ROUTE' | 'ARRIVED' | 'TOWING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';

export type MissionPriorityEnum = 'NORMAL' | 'HIGH' | 'URGENT';

export type MissionTypeEnum = 'TOWING' | 'TRANSPORT' | 'REPAIR' | 'ASSISTANCE' | 'TIRE' | 'OTHER';

export type ProviderTypeEnum = 'INTERNATIONAL' | 'NATIONAL' | 'PRIVATE';

interface MissionType {
    name: MissionTypeEnum;
    description: string;
}

interface MissionType {
    name: MissionTypeEnum;
    description: string;
}

interface MissionStatusHistory {
    status: string;
    createdAt: string;
    notes: string;
    createdBy: string;
}
