import { inject, Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { catchError, Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly currentUserSignal = signal<User | null>(null);
    private readonly isAuthenticatedSignal = signal<boolean>(false);

    private readonly API_URL = 'http://localhost:8080/api';
    private readonly AUTH_ENDPOINT = `${this.API_URL}/auth`;

    constructor() {
        this.initializeFromLocalStorage();
    }

    get currentUser(): Signal<User | null> {
        return this.currentUserSignal.asReadonly();
    }

    get isAuthenticated(): Signal<boolean> {
        return this.isAuthenticatedSignal.asReadonly();
    }

    /**
     * Login method to authenticate the user
     * @param loginRequest
     */
    login(loginRequest: LoginRequest): Observable<User> {
        return this.http.post<LoginResponse>(`${this.AUTH_ENDPOINT}/login`, loginRequest).pipe(
            tap((response) => {
                // Store the token and refresh token in local storage
                localStorage.setItem('token', response.token);
                localStorage.setItem('refreshToken', response.refreshToken);

                // update the current user signal
                this.currentUserSignal.set(response.userResponse);
                // update the isAuthenticated signal
                this.isAuthenticatedSignal.set(true);
                // store the user in local storage for remember me
                localStorage.setItem('user', JSON.stringify(response.userResponse));
            }),
            map((response) => response.userResponse)
        );
    }

    /**
     * Method to check if the user is authenticated
     */
    logout(): void {
        // Remove the token and refresh token from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Update the current user signal
        this.currentUserSignal.set(null);
        // Update the isAuthenticated signal
        this.isAuthenticatedSignal.set(false);

        // Redirect to the login page
        this.router.navigate(['/auth/login']);
    }

    /**
     * refreashToken method to refresh the token
     */
    refreashToken(): Observable<string | null> {
        const refreashToken = localStorage.getItem('refreshToken');

        if (!refreashToken) {
            return of(null);
        }

        return this.http.post<{ token: string }>(`${this.AUTH_ENDPOINT}/refresh`, { refreshToken: refreashToken }).pipe(
            tap((response) => {
                // Store the new token in local storage
                localStorage.setItem('token', response.token);
            }),
            map((response) => response.token),
            catchError(() => {
                this.logout();
                return of(null);
            })
        );
    }

    /**
     * Method to get token from local storage
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Method to check if the token is expired
     */
    isTokenExpired(): boolean {
        const token = this.getToken();

        if (!token) return true;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }

    /**
     * Method to check if the user has a specific role
     * @param role role to check
     */
    hasRole(role: string): boolean {
        const user = this.currentUserSignal();

        if (!user) return false;

        return user.role === role;
    }

    /**
     * Initialize from local storage
     */
    private initializeFromLocalStorage(): void {
        const token = this.getToken();
        const userJson = localStorage.getItem('user');

        if (token && !this.isTokenExpired() && userJson) {
            try {
                const user: User = JSON.parse(userJson) as User;
                this.currentUserSignal.set(user);
                this.isAuthenticatedSignal.set(true);
            } catch (error) {
                console.error('Error parsing user from local storage:', error);
                this.logout();
            }
        } else if (this.isTokenExpired()) {
            this.logout();
        }
    }
}
