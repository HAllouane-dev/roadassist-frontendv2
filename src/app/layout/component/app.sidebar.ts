import { Component, ElementRef, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../features/auth/services/auth.service';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, MenuModule, AppMenu],
    template: ` <div class="layout-sidebar">
        <app-menu [menuItems]="menuItems"></app-menu>
    </div>`
})
export class AppSidebar {
    private readonly authService = inject(AuthService);
    menuItems: MenuItem[] = [];

    constructor(public el: ElementRef) {
        // Générer le menu en fonction du rôle
        this.generateMenu();
    }

    /**
     * Génère le menu en fonction du rôle de l'utilisateur
     */
    private generateMenu(): void {
        const role = this.authService.getUserRole();

        // Menu de base pour tous les rôles
        this.menuItems = [
            {
                label: 'Profil',
                items: [
                    {
                        label: 'Mon profil',
                        icon: 'pi pi-user',
                        routerLink: '/profile'
                    },
                    {
                        label: 'Déconnexion',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.authService.logout();
                        }
                    }
                ]
            }
        ];

        // Ajouter les éléments spécifiques selon le rôle
        switch (role) {
            case 'ADMIN':
                this.menuItems.unshift(
                    {
                        label: 'Tableau de bord',
                        icon: 'pi pi-home',
                        routerLink: '/admin/dashboard'
                    },
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-users',
                        routerLink: '/admin/users'
                    },
                    {
                        label: 'Configurations',
                        icon: 'pi pi-cog',
                        routerLink: '/admin/settings'
                    }
                );
                break;

            case 'OPERATOR':
                this.menuItems.unshift({
                    label: 'Tableau de bord',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: '/operator/dashboard'
                        },
                        {
                            label: 'Gestion des missions',
                            icon: 'pi pi-car',
                            items: [
                                {
                                    label: 'Mes missions',
                                    icon: 'pi pi-fw pi-car',
                                    routerLink: '/operator/missions'
                                },
                                {
                                    label: 'Créer une mission',
                                    icon: 'pi pi-fw pi-plus',
                                    routerLink: '/operator/missions/create'
                                },
                                {
                                    label: 'Missions en cours',
                                    icon: 'pi pi-fw pi-clock',
                                    routerLink: '/operator/missions/in-progress'
                                },
                                {
                                    label: 'Fiche affectation mission',
                                    icon: 'pi pi-fw pi-file',
                                    routerLink: '/operator/missions/assignment-sheet'
                                },
                                {
                                    label: 'Historique',
                                    icon: 'pi pi-fw pi-history',
                                    routerLink: '/operator/missions/history'
                                }
                            ]
                        },
                        {
                            label: 'Chauffeurs',
                            icon: 'pi pi-users',
                            routerLink: '/operator/drivers'
                        }
                    ]
                });
                break;

            case 'DRIVER':
                this.menuItems.unshift(
                    {
                        label: 'Tableau de bord',
                        icon: 'pi pi-home',
                        routerLink: '/driver/dashboard'
                    },
                    {
                        label: 'Mes missions',
                        icon: 'pi pi-car',
                        routerLink: '/driver/my-missions'
                    },
                    {
                        label: 'Historique',
                        icon: 'pi pi-history',
                        routerLink: '/driver/history'
                    }
                );
                break;
        }
    }
}
