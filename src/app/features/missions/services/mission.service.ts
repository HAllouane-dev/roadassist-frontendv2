import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MissionResponse } from '../models/mission.model';

export class MissionService {
    private readonly apiUrl = 'http://localhost:8080/api/v1';
    private readonly httpClient = inject(HttpClient);

    /**
     * Get all missions with pagination and sorting
     */
    getMissions(): Observable<MissionResponse[]> {
        return this.httpClient.get<MissionResponse[]>(`${this.apiUrl}/missions/all`);
    }
}
