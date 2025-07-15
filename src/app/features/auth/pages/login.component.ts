import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, RippleModule, ToastModule],
    providers: [MessageService],
    styles: [
        `
            .layout-topbar-logo-container {
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
            }
            .logo-image-only {
                height: 15rem !important;
                width: auto !important;
            }
        `
    ],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="layout-topbar-logo-container">
                                <img src="assets/images/logo.png" alt="Logo" class="logo-image-only" />
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Nous vous souhaitons la bienvenue sur RoadAssist Pro !</div>
                            <span class="text-muted-color font-medium">Connectez-vous pour continuer</span>
                        </div>

                        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                            <div>
                                <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nom d'utilisateur</label>
                                <input pInputText id="username" type="text" placeholder="Nom d'utilisateur" class="w-full md:w-[30rem] mb-2" formControlName="username" />
                                @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
                                    <small class="p-error block mb-4">Le nom d'utilisateur est requis</small>
                                }
                                <div class="mb-4"></div>

                                <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Mot de passe</label>
                                <p-password id="password" formControlName="password" placeholder="Mot de passe" [toggleMask]="true" styleClass="mb-2" [feedback]="false" [fluid]="true"></p-password>
                                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                                    <small class="p-error block mb-4">Le mot de passe est requis</small>
                                }
                                <div class="mb-4"></div>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <div class="flex items-center">
                                        <p-checkbox formControlName="rememberMe" binary class="mr-2"></p-checkbox>
                                        <label for="rememberme1">Souvenez-vous de moi</label>
                                    </div>
                                    <a class="font-medium no-underline ml-2 text-right cursor-pointer text-primary" routerLink="/auth/forgot-password">Mot de passe oublié ?</a>
                                </div>

                                <p-button type="submit" label="Sign In" styleClass="w-full" [disabled]="loginForm.invalid || loading" [loading]="loading"></p-button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <p-toast></p-toast>
    `
})
export class LoginComponent implements OnInit {
    loading = false;
    returnUrl: string = '';
    loginForm!: FormGroup;

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly messageService = inject(MessageService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            rememberMe: [false]
        });

        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] ?? '';

        if (this.authService.checkIsAuthenticated()) {
            if (this.returnUrl) {
                this.router.navigateByUrl(this.returnUrl).then(() => {});
            } else {
                this.authService.redirectToDashboard();
            }
        }
    }

    /**
     * Handles the form submission.
     */
    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const loginRequest = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password
        };

        this.authService.login(loginRequest).subscribe({
            next: (user) => {
                console.log('Login successful', user);
                this.loading = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Connexion réussie',
                    detail: 'Bienvenue sur RoadAssist Pro!'
                });
            },
            error: (error) => {
                console.error('Login error', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de connexion',
                    detail: error.error?.message ?? 'Identifiants invalides'
                });
            }
        });
    }
}
