import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../../features/auth/services/auth.service';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';

function isAuthRequest(req: HttpRequest<unknown>): boolean {
    return req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
}

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function redirectToLogin(authService: AuthService, router: Router): void {
    authService.logout();
    router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } }).then(() => {
        console.log('Navigation to login page successful');
    });
}

function handleUnauthorizedError(error: any, req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService, router: Router): Observable<any> {
    return authService.refreshToken().pipe(
        switchMap((newToken) => {
            if (newToken) {
                const newReq = addTokenToRequest(req, newToken);
                return next(newReq);
            } else {
                redirectToLogin(authService, router);
                return throwError(() => error);
            }
        }),
        catchError(() => {
            redirectToLogin(authService, router);
            return throwError(() => error);
        })
    );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (isAuthRequest(req)) {
        return next(req);
    }

    const token = authService.getToken();
    if (token) {
        req = addTokenToRequest(req, token);
    }

    return next(req).pipe(
        catchError((error) => {
            if (error.status === HttpStatusCode.Unauthorized) {
                return handleUnauthorizedError(error, req, next, authService, router);
            }

            if (error.status === HttpStatusCode.Forbidden) {
                router.navigate(['/access-denied']).then(() => {
                    console.log('Navigation to access denied page successful');
                });
            }

            return throwError(() => error);
        })
    );
};
