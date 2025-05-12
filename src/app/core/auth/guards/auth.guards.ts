import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

export const authGuards: CanActivateFn = (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.checkIsAuthenticated()) {
        return true;
    }

    router
        .navigate(['/auth/login'], {
            queryParams: {
                returnUrl: state.url
            }
        })
        .then((r) => {});

    return false;
};
