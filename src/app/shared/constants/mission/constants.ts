import { MissionPriorityFormatted, MissionStatusFormatted, MissionTypeFormatted } from '../../../features/missions/models/mission.model';

export const missionStatus: MissionStatusFormatted[] = [
    { name: 'Created', code: 'CREATED' },
    { name: 'Pre-Assigned', code: 'PRE_ASSIGNED' },
    { name: 'Assigned', code: 'ASSIGNED' },
    { name: 'Accepted', code: 'ACCEPTED' },
    { name: 'In Route', code: 'IN_ROUTE' },
    { name: 'Arrived', code: 'ARRIVED' },
    { name: 'Towing', code: 'TOWING' },
    { name: 'In Transit', code: 'IN_TRANSIT' },
    { name: 'Delivered', code: 'DELIVERED' },
    { name: 'Cancelled', code: 'CANCELLED' }
];

export const missionTypes: MissionTypeFormatted[] = [
    { name: 'Towing', code: 'TOWING' },
    { name: 'Tire Change', code: 'TIRE' },
    { name: 'Transport', code: 'TRANSPORT' },
    { name: 'Repair', code: 'REPAIR' },
    { name: 'Assistance', code: 'ASSISTANCE' },
    { name: 'Other', code: 'OTHER' }
];

export const missionPriorities: MissionPriorityFormatted[] = [
    { name: 'Normal', code: 'NORMAL' },
    { name: 'High', code: 'HIGH' },
    { name: 'Urgent', code: 'URGENT' }
];
