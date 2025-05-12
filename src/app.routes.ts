import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuards } from './app/core/auth/guards/auth.guards';
import { roleGuard } from './app/core/auth/guards/auth.roles';

export const appRoutes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./app/features/auth/routes').then((m) => m.AUTH_ROUTES) // Lazy load auth module
    },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuards], // Guard to protect the main layout
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                canActivate: [authGuards],
                loadComponent: () => import('./app/features/dashboard-router/pages/dashboard-router.component').then((m) => m.DashboardRouterComponent) // Lazy load dashboard module
            },
            {
                path: 'operator',
                canActivate: [roleGuard],
                data: { roles: ['OPERATOR', 'ADMIN'] },
                loadChildren: () => import('./app/features/operator/routes').then((m) => m.OPERATOR_ROUTES) // Lazy load operator module
            }
        ]
    },
    { path: '**', redirectTo: 'auth' }
];
