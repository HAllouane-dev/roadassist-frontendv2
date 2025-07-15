import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Card } from 'primeng/card';
import { Steps } from 'primeng/steps';
import { DatePipe, NgClass } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Calendar } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Panel } from 'primeng/panel';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { MultiSelect } from 'primeng/multiselect';
import { Chip } from 'primeng/chip';
import { ProviderService } from '../../services/provider.service';
import { ProviderResponse } from '../../models/provider.model';
import { MissionService } from '../../services/mission.service';
import { MissionRequest, MissionResponse } from '../../models/mission.model';
import { ErrorResponse, ErrorValidationResponse } from '../../../../shared/models/error-response.model';
import { Router } from '@angular/router';
import { MissionValidationService } from '../../services/mission.validation.service';
import { ProgressBar } from 'primeng/progressbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-create-mission-form',
    imports: [InputText, Textarea, FormsModule, DatePickerModule, Toast, Card, Steps, ReactiveFormsModule, NgClass, Tooltip, Calendar, DropdownModule, Panel, DatePipe, Dialog, ButtonDirective, MultiSelect, Chip, ProgressBar, ConfirmDialog],
    templateUrl: './create-mission-form.component.html',
    providers: [MessageService, ProviderService, MissionService, MissionValidationService, ConfirmationService]
})
export class CreateMissionFormComponent implements OnInit, OnDestroy {
    private readonly fb: FormBuilder = inject(FormBuilder);
    private readonly router: Router = inject(Router);
    public readonly missionValidationService: MissionValidationService = inject(MissionValidationService);
    private readonly missionService: MissionService = inject(MissionService);
    private readonly messageService: MessageService = inject(MessageService);
    private readonly providerService: ProviderService = inject(ProviderService);
    private readonly confirmationService: ConfirmationService = inject(ConfirmationService);
    private readonly destroy$ = new Subject<void>();

    missionForm!: FormGroup;
    activeIndex = 0;
    submitted = false;
    loading = false;
    showDialog = false;
    missionCreatedReference = '';

    // Options pour les étapes
    steps = [{ label: 'Informations requérant' }, { label: 'Détails fournisseur' }, { label: 'Détails véhicule' }, { label: 'Localisation' }, { label: 'Détails mission' }, { label: 'Récapitulatif' }];

    // Options pour les sélecteurs
    missionTypes = [
        { name: 'Remorquage', code: 'TOWING' },
        { name: 'Réparation sur place', code: 'REPAIR' },
        { name: 'Livraison de carburant', code: 'FUEL' },
        { name: 'Changement de batterie', code: 'BATTERY' },
        { name: 'Changement de pneu', code: 'TIRE' }
    ];

    priorityOptions = [
        { name: 'Normale', code: 'NORMAL' },
        { name: 'Élevée', code: 'HIGH' },
        { name: 'Urgente', code: 'URGENT' }
    ];

    providerOptions: ProviderResponse[] = [];

    ngOnInit() {
        this.initForm();
        this.loadProviders();
        this.setupFormSubscriptions();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Initialisation du formulaire avec validations personnalisées
    initForm() {
        this.missionCreatedReference = '';
        this.missionForm = this.fb.group({
            requesterName: ['', [MissionValidationService.requesterNameValidator()]],
            requesterPhone: ['', [MissionValidationService.requesterPhoneValidator()]],
            receivedAt: [new Date(), [Validators.required]],
            providerReference: ['', [MissionValidationService.providerReferenceValidator()]],
            fournisseur: ['', [Validators.required]],
            vehicleMake: ['', [MissionValidationService.vehicleMakeValidator()]],
            vehicleModel: ['', [Validators.required]],
            vehiclePlate: ['', [MissionValidationService.vehiclePlateValidator()]],
            pickupAddress: ['', [MissionValidationService.pickupAddressValidator()]],
            destinationAddress: ['', [MissionValidationService.destinationAddressValidator()]],
            missionTypes: [[], [MissionValidationService.missionTypesValidator()]],
            priority: ['NORMAL', [Validators.required]],
            notes: ['', [MissionValidationService.notesValidator()]]
        });
    }

    // Configuration des subscriptions pour la validation en temps réel
    setupFormSubscriptions() {
        // Formatage automatique du téléphone
        this.missionForm
            .get('requesterPhone')
            ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
            .subscribe((phone) => {
                if (phone && this.isFieldValid('requesterPhone')) {
                    const formatted = this.missionValidationService.formatPhoneDisplay(phone);
                    if (formatted !== phone) {
                        // Mise à jour silencieuse pour éviter les boucles infinies
                        this.missionForm.get('requesterPhone')?.setValue(formatted, { emitEvent: false });
                    }
                }
            });

        // Formatage automatique de la plaque d'immatriculation
        this.missionForm
            .get('vehiclePlate')
            ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
            .subscribe((plate) => {
                if (plate) {
                    const formatted = this.missionValidationService.formatVehiclePlate(plate);
                    if (formatted !== plate) {
                        this.missionForm.get('vehiclePlate')?.setValue(formatted, { emitEvent: false });
                    }
                }
            });

        // Auto-génération de la référence fournisseur si vide
        this.missionForm
            .get('providerReference')
            ?.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500))
            .subscribe((value) => {
                if (!value) {
                    this.generateProviderReference();
                }
            });

        // Validation des types de mission en temps réel
        this.missionForm
            .get('missionTypes')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((types) => {
                if (types && types.length > 5) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Attention',
                        detail: "Un grand nombre de types de mission peut complexifier l'intervention"
                    });
                }
            });
    }

    // Getter pour accéder facilement aux contrôles du formulaire
    get f() {
        return this.missionForm.controls;
    }

    // Génération automatique de la référence fournisseur
    generateProviderReference() {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + (today.getMonth() + 1).toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0');

        // Simulation d'un compteur (dans un vrai projet, cela viendrait du backend)
        const randomCounter = Math.floor(Math.random() * 999) + 1;
        const reference = `PRV-${dateStr}-${randomCounter.toString().padStart(3, '0')}`;

        this.missionForm.get('providerReference')?.setValue(reference);
    }

    // Changement d'étape via les étapes cliquables
    onActiveIndexChange(event: number) {
        if (event > this.activeIndex) {
            // Validation de l'étape actuelle avant de passer à une suivante
            if (this.validateCurrentStep()) {
                this.activeIndex = event;
            } else {
                this.submitted = true;
                this.showStepValidationErrors();
            }
        } else {
            // Navigation vers une étape précédente, toujours autorisée
            this.activeIndex = event;
        }
    }

    // Passer à l'étape suivante
    nextStep() {
        this.submitted = true;

        if (this.validateCurrentStep()) {
            this.submitted = false;
            this.activeIndex++;
        } else {
            this.showStepValidationErrors();
        }
    }

    // Revenir à l'étape précédente
    prevStep() {
        this.activeIndex--;
        this.submitted = false;
    }

    // Validation de l'étape courante avec messages d'erreur détaillés
    validateCurrentStep(): boolean {
        let currentStepErrors: string[] = [];

        switch (this.activeIndex) {
            case 0:
                currentStepErrors = this.validateStep0();
                break;
            case 1:
                currentStepErrors = this.validateStep1();
                break;
            case 2:
                currentStepErrors = this.validateStep2();
                break;
            case 3:
                currentStepErrors = this.validateStep3();
                break;
            case 4:
                currentStepErrors = this.validateStep4();
                break;
            default:
                return true;
        }

        if (currentStepErrors.length > 0) {
            this.currentStepErrors = currentStepErrors;
            return false;
        }

        return true;
    }

    private validateStep0(): string[] {
        const errors: string[] = [];
        if (this.f['requesterName'].invalid) {
            errors.push('Nom du requérant: ' + this.getFieldError('requesterName'));
        }
        if (this.f['requesterPhone'].invalid) {
            errors.push('Téléphone: ' + this.getFieldError('requesterPhone'));
        }
        if (this.f['receivedAt'].invalid) {
            errors.push('Date de réception obligatoire');
        }
        return errors;
    }

    private validateStep1(): string[] {
        const errors: string[] = [];
        if (this.f['providerReference'].invalid) {
            errors.push('Référence fournisseur: ' + this.getFieldError('providerReference'));
        }
        if (this.f['fournisseur'].invalid) {
            errors.push('Fournisseur obligatoire');
        }
        return errors;
    }

    private validateStep2(): string[] {
        const errors: string[] = [];
        if (this.f['vehicleMake'].invalid) {
            errors.push('Marque du véhicule: ' + this.getFieldError('vehicleMake'));
        }
        if (this.f['vehiclePlate'].invalid) {
            errors.push("Plaque d'immatriculation: " + this.getFieldError('vehiclePlate'));
        }
        return errors;
    }

    private validateStep3(): string[] {
        const errors: string[] = [];
        if (this.f['pickupAddress'].invalid) {
            errors.push('Adresse de récupération: ' + this.getFieldError('pickupAddress'));
        }
        if (this.f['destinationAddress'].invalid) {
            errors.push('Adresse de destination: ' + this.getFieldError('destinationAddress'));
        }
        return errors;
    }

    private validateStep4(): string[] {
        const errors: string[] = [];
        if (this.f['missionTypes'].invalid) {
            errors.push('Types de mission: ' + this.getFieldError('missionTypes'));
        }
        if (this.f['notes'].invalid) {
            errors.push('Notes: ' + this.getFieldError('notes'));
        }
        return errors;
    }

    private currentStepErrors: string[] = [];

    // Affichage des erreurs de validation pour l'étape courante
    showStepValidationErrors() {
        if (this.currentStepErrors.length > 0) {
            const errorMessage = this.currentStepErrors.join('\n');
            this.messageService.add({
                severity: 'error',
                summary: 'Erreurs de validation',
                detail: errorMessage,
                life: 8000
            });
        }
    }

    // Chargement des fournisseurs depuis le service
    loadProviders() {
        this.providerService.getProviders().subscribe({
            next: (providers) => {
                this.providerOptions = providers;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des fournisseurs:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les fournisseurs'
                });
            }
        });
    }

    // Sélection d'un fournisseur par id
    getProviderById(providerId: number): string {
        const provider = this.providerOptions.find((p) => p.id === providerId);
        return provider ? provider.name : '';
    }

    // Soumission du formulaire avec validation complète
    onSubmit() {
        this.submitted = true;

        if (this.missionForm.valid) {
            this.loading = true;

            console.log('Données soumises:', this.missionForm.value);
            this.missionService.createMission(this.buildMissionBodyRequest()).subscribe({
                next: (response: MissionResponse) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Mission créée avec succès'
                    });
                    this.missionCreatedReference = response.id;
                    this.loading = false;
                    this.showDialog = true;
                },
                error: (error) => {
                    this.handleSubmissionError(error);
                    this.loading = false;
                }
            });
        } else {
            this.handleFormValidationErrors();
        }
    }

    // Gestion des erreurs de soumission
    private handleSubmissionError(error: any) {
        const errorResponse = error.error as ErrorResponse | ErrorValidationResponse;
        console.error('Erreur lors de la création de la mission:', error);

        if ('fieldsErrors' in errorResponse) {
            // Erreur de validation côté serveur
            const errorMessages = errorResponse.fieldsErrors.map((e) => `${e.field}: ${e.message}`).join('\n');
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: errorMessages,
                closable: true,
                life: 60000
            });

            // Appliquer les erreurs aux champs correspondants
            this.applyServerValidationErrors(errorResponse.fieldsErrors);
        } else {
            // Erreur générale
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: errorResponse.message || 'Une erreur est survenue',
                closable: true,
                life: 60000
            });
        }
    }

    // Application des erreurs de validation serveur aux champs
    private applyServerValidationErrors(fieldsErrors: any[]) {
        fieldsErrors.forEach((error) => {
            const control = this.missionForm.get(error.field);
            if (control) {
                control.setErrors({
                    serverError: {
                        message: error.message
                    }
                });
                control.markAsTouched();
            }
        });
    }

    // Gestion des erreurs de validation côté client
    private handleFormValidationErrors() {
        // Marquer tous les champs comme touchés pour afficher les erreurs
        this.markFormGroupTouched(this.missionForm);

        // Collecter toutes les erreurs
        const allErrors = this.getAllFormErrors();

        if (allErrors.length > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Formulaire invalide',
                detail: `Veuillez corriger les ${allErrors.length} erreur(s) suivante(s):\n${allErrors.join('\n')}`,
                closable: true,
                life: 10000
            });
        }
    }

    // Marquer tous les champs comme touchés
    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);
            control?.markAsTouched({ onlySelf: true });
        });
    }

    // Collecter toutes les erreurs du formulaire
    getAllFormErrors(): string[] {
        const errors: string[] = [];

        Object.keys(this.missionForm.controls).forEach((key) => {
            const control = this.missionForm.get(key);
            if (control?.errors) {
                const fieldError = this.getFieldError(key);
                if (fieldError) {
                    errors.push(`${this.getFieldLabel(key)}: ${fieldError}`);
                }
            }
        });

        return errors;
    }

    // Obtenir le label d'un champ pour les messages d'erreur
    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            requesterName: 'Nom du requérant',
            requesterPhone: 'Téléphone',
            receivedAt: 'Date de réception',
            providerReference: 'Référence fournisseur',
            fournisseur: 'Fournisseur',
            vehicleMake: 'Marque du véhicule',
            vehicleModel: 'Modèle du véhicule',
            vehiclePlate: "Plaque d'immatriculation",
            pickupAddress: 'Adresse de récupération',
            destinationAddress: 'Adresse de destination',
            missionTypes: 'Types de mission',
            priority: 'Priorité',
            notes: 'Notes'
        };

        return labels[fieldName] || fieldName;
    }

    // Construire le body de la mission à partir du formulaire
    buildMissionBodyRequest(): MissionRequest {
        return {
            providerReference: this.missionForm.value.providerReference,
            providerId: this.missionForm.value.fournisseur.id ?? this.missionForm.value.fournisseur,
            missionType: this.missionForm.value.missionTypes.map((code: string) => ({ name: code })),
            requesterName: this.missionForm.value.requesterName,
            requesterPhone: this.missionForm.value.requesterPhone,
            receivedAt: this.missionForm.value.receivedAt.toISOString().replace('Z', ''),
            priority: this.missionForm.value.priority,
            vehicleMake: this.missionForm.value.vehicleMake,
            vehicleModel: this.missionForm.value.vehicleModel,
            vehiclePlate: this.missionForm.value.vehiclePlate,
            pickupAddress: this.missionForm.value.pickupAddress,
            destinationAddress: this.missionForm.value.destinationAddress,
            destinationLatitude: 0, // À implémenter avec la géolocalisation
            destinationLongitude: 0, // À implémenter avec la géolocalisation
            pickupLatitude: 0, // À implémenter avec la géolocalisation
            pickupLongitude: 0, // À implémenter avec la géolocalisation
            notes: this.missionForm.value.notes ?? ''
        };
    }

    // Réinitialisation du formulaire pour une nouvelle mission avec confirmation
    resetForm() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les données saisies seront perdues.',
            header: 'Confirmer la réinitialisation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, réinitialiser',
            rejectLabel: 'Annuler',
            accept: () => {
                this.performReset();
            }
        });
    }

    // Exécution de la réinitialisation
    private performReset() {
        this.missionForm.reset({
            receivedAt: new Date(),
            priority: 'NORMAL'
        });
        this.activeIndex = 0;
        this.submitted = false;
        this.showDialog = false;
        this.currentStepErrors = [];

        // Régénérer une nouvelle référence fournisseur
        setTimeout(() => {
            this.generateProviderReference();
        }, 100);

        this.messageService.add({
            severity: 'info',
            summary: 'Formulaire réinitialisé',
            detail: 'Vous pouvez créer une nouvelle mission'
        });
    }

    // Redirection vers les détails de la mission
    viewMission() {
        this.showDialog = false;
        console.log('Navigation vers les détails de la mission');
        this.router.navigate(['/operator/missions', this.missionCreatedReference]);
    }

    // =====================================================
    // MÉTHODES DE VALIDATION ET AFFICHAGE
    // =====================================================

    // Obtenir le message d'erreur pour un champ
    getFieldError(fieldName: string): string | null {
        const field = this.missionForm.get(fieldName);

        if (field && field.invalid && (field.dirty || field.touched)) {
            const errors = field.errors;
            if (errors) {
                return this.missionValidationService.formatValidationError(errors);
            }
        }
        return null;
    }

    // Vérifier si un champ est invalide
    isFieldInvalid(fieldName: string): boolean {
        const field = this.missionForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    // Vérifier si un champ est valide
    isFieldValid(fieldName: string): boolean {
        const field = this.missionForm.get(fieldName);
        return !!(field && field.valid && field.value && (field.dirty || field.touched));
    }

    // Vérifier si un champ est en cours de validation asynchrone
    isFieldPending(fieldName: string): boolean {
        const field = this.missionForm.get(fieldName);
        return !!field?.pending;
    }

    // Obtenir la classe CSS pour un champ selon son état
    getFieldClass(fieldName: string): string {
        if (this.isFieldValid(fieldName)) return 'is-valid';
        if (this.isFieldInvalid(fieldName)) return 'is-invalid';
        if (this.isFieldPending(fieldName)) return 'is-pending';
        return '';
    }

    // =====================================================
    // FONCTIONS UTILITAIRES POUR L'AFFICHAGE
    // =====================================================

    // Obtenir le nom d'un type de mission à partir de son code
    getMissionTypeName(code: string): string {
        const type = this.missionTypes.find((t) => t.code === code);
        return type ? type.name : code;
    }

    // Obtenir le nom d'une priorité à partir de son code
    getPriorityName(code: string): string {
        const priority = this.priorityOptions.find((p) => p.code === code);
        return priority ? priority.name : 'Normale';
    }

    // Formater la date courante
    getFormattedDate(): string {
        const date = new Date();
        return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
    }

    // Vérifier si le formulaire peut être soumis
    canSubmit(): boolean {
        return this.missionForm.valid && !this.loading && !this.hasAnyPendingValidation();
    }

    // Vérifier s'il y a des validations asynchrones en cours
    hasAnyPendingValidation(): boolean {
        return Object.keys(this.missionForm.controls).some((key) => this.missionForm.get(key)?.pending);
    }

    // Obtenir un résumé des données du formulaire
    getFormSummary(): any {
        return {
            requester: {
                name: this.missionForm.get('requesterName')?.value,
                phone: this.missionValidationService.formatPhoneDisplay(this.missionForm.get('requesterPhone')?.value)
            },
            provider: {
                reference: this.missionForm.get('providerReference')?.value,
                name: this.getProviderById(this.missionForm.get('fournisseur')?.value)
            },
            vehicle: {
                make: this.missionForm.get('vehicleMake')?.value,
                model: this.missionForm.get('vehicleModel')?.value ?? 'Non spécifié',
                plate: this.missionValidationService.formatVehiclePlate(this.missionForm.get('vehiclePlate')?.value)
            },
            mission: {
                types: this.missionForm.get('missionTypes')?.value?.map((code: string) => this.getMissionTypeName(code)) ?? [],
                priority: this.getPriorityName(this.missionForm.get('priority')?.value),
                notes: this.missionForm.get('notes')?.value ?? 'Aucune note'
            }
        };
    }

    // Valider l'étape courante et retourner le pourcentage de completion
    getCurrentStepCompletionPercentage(): number {
        const currentStepFields = this.getCurrentStepFields();
        const validFields = currentStepFields.filter((field) => this.missionForm.get(field)?.valid);

        return currentStepFields.length > 0 ? Math.round((validFields.length / currentStepFields.length) * 100) : 100;
    }

    // Obtenir les champs de l'étape courante
    private getCurrentStepFields(): string[] {
        const stepFields: { [key: number]: string[] } = {
            0: ['requesterName', 'requesterPhone', 'receivedAt'],
            1: ['providerReference', 'fournisseur'],
            2: ['vehicleMake', 'vehiclePlate'],
            3: ['pickupAddress', 'destinationAddress'],
            4: ['missionTypes'],
            5: [] // Récapitulatif, pas de champs
        };

        return stepFields[this.activeIndex] || [];
    }

    // Obtenir le statut global du formulaire
    getFormStatus(): 'valid' | 'invalid' | 'pending' {
        if (this.missionForm.pending) return 'pending';
        if (this.missionForm.valid) return 'valid';
        return 'invalid';
    }

    // Sauvegarder le formulaire en brouillon (localStorage)
    saveDraft() {
        const draftData = {
            ...this.missionForm.value,
            savedAt: new Date().toISOString(),
            currentStep: this.activeIndex
        };

        localStorage.setItem('mission-draft', JSON.stringify(draftData));
        this.messageService.add({
            severity: 'info',
            summary: 'Brouillon sauvegardé',
            detail: 'Vos données ont été sauvegardées localement'
        });
    }

    // Charger un brouillon existant
    loadDraft() {
        const draftData = localStorage.getItem('mission-draft');
        if (draftData) {
            try {
                const draft = JSON.parse(draftData);
                this.missionForm.patchValue({
                    ...draft,
                    receivedAt: new Date(draft.receivedAt)
                });
                this.activeIndex = draft.currentStep ?? 0;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Brouillon chargé',
                    detail: `Données du ${new Date(draft.savedAt).toLocaleDateString()}`
                });
            } catch (error) {
                console.error('Erreur lors du chargement du brouillon:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger le brouillon'
                });
            }
        }
    }

    // Vérifier s'il existe un brouillon
    hasDraft(): boolean {
        return !!localStorage.getItem('mission-draft');
    }

    // Supprimer le brouillon
    clearDraft() {
        localStorage.removeItem('mission-draft');
        this.messageService.add({
            severity: 'info',
            summary: 'Brouillon supprimé',
            detail: 'Les données sauvegardées ont été effacées'
        });
    }
}
