import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

export const roleGuard: CanActivateFn = (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles = route.data['roles'] as string[];

    if (!authService.checkIsAuthenticated()) {
        return router.createUrlTree(['/auth/login'], {
            queryParams: {
                returnUrl: state.url
            }
        });
    }

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    const userRole = authService.getUserRole();

    if (requiredRoles.includes(userRole)) {
        return true;
    }

    return router.createUrlTree([getDashboardRoute(userRole)]);
};

/**
 * Get the dashboard route based on the user role
 * @param userRole The role of the user
 */
function getDashboardRoute(userRole: string): string {
    switch (userRole) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'OPERATOR':
            return '/operator/dashboard';
        case 'DRIVER':
            return '/driver/dashboard';
        default:
            return '/access-denied'; // Redirect to an access denied page or a default route
    }
}
