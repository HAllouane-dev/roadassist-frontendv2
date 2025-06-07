import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MissionRequest, MissionResponse, MissionUpdateRequest } from '../models/mission.model';

export class MissionService {
    private readonly apiUrl = 'http://localhost:8080/api/v1';
    private readonly httpClient = inject(HttpClient);

    /**
     * Get all missions with pagination and sorting
     */
    getMissions(): Observable<MissionResponse[]> {
        return this.httpClient.get<MissionResponse[]>(`${this.apiUrl}/missions/all`);
    }

    /**
     * Get mission by reference
     */
    getMissionById(id: string): Observable<MissionResponse> {
        return this.httpClient.get<MissionResponse>(`${this.apiUrl}/missions/${id}`);
    }

    /**
     * Create a new mission
     */
    createMission(mission: MissionRequest): Observable<MissionResponse> {
        return this.httpClient.post<MissionResponse>(`${this.apiUrl}/missions`, mission);
    }

    /**
     * Update an existing mission
     */
    updateMission(id: string, mission: MissionUpdateRequest): Observable<MissionResponse> {
        return this.httpClient.put<MissionResponse>(`${this.apiUrl}/missions/${id}`, mission);
    }
}
