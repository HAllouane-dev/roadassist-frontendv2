import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
    selector: 'app-dashboard-router',
    standalone: true,
    template: `<div>Redirection...</div>`
})
export class DashboardRouterComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    ngOnInit(): void {
        const role = this.authService.getUserRole();

        switch (role) {
            case 'ADMIN':
                this.router.navigate(['/admin/dashboard']).then((r) => {
                    console.log('Navigation to admin dashboard successful');
                });
                break;
            case 'OPERATOR':
                this.router.navigate(['/operator/dashboard']).then((r) => {
                    console.log('Navigation to operator dashboard successful');
                });
                break;
            case 'DRIVER':
                this.router.navigate(['/driver/dashboard']).then((r) => {
                    console.log('Navigation to driver dashboard successful');
                });
                break;
            default:
                this.router.navigate(['/access-denied']).then((r) => {
                    console.log('Navigation to access denied page');
                }); // Redirect to an access denied page or a default route
                break;
        }
    }
}
