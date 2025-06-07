import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProviderResponse } from '../models/provider.model';

export class ProviderService {
    private readonly apiUrl = 'http://localhost:8080/api/v1';
    private readonly httpClient = inject(HttpClient);

    /**
     * Get all providers
     */
    getProviders(): Observable<ProviderResponse[]> {
        return this.httpClient.get<ProviderResponse[]>(`${this.apiUrl}/providers/all`);
    }
}
