import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        loadChildren: () => import('./app/features/auth/routes').then((m) => m.AUTH_ROUTES) // Lazy load auth module
    },
    { path: '**', redirectTo: '/notfound' }
];
