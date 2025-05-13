import { Routes } from '@angular/router';

export const OPERATOR_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/operator-dashboard/operator-dashboard.component').then((m) => m.OperatorDashboardComponent),
        title: 'Tableau de bord opérateur - RoadAssist Pro'
    },
    {
        path: 'missions',
        loadComponent: () => import('./pages/operator-missions/operator-missions.component').then((m) => m.OperatorMissionsComponent),
        title: 'Missions opérateur - RoadAssist Pro'
    }
];
