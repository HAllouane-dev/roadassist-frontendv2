import { NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { GalleriaModule } from 'primeng/galleria';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { TabPanel, TabView } from 'primeng/tabview';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { missionPriorities, missionStatus, missionTypes } from '../../../../shared/constants/mission/constants';
import { MissionResponse } from '../../models/mission.model';
import { MissionService } from '../../services/mission.service';
import { MissionValidationService } from '../../services/mission.validation.service';

@Component({
    selector: 'app-mission-details',
    standalone: true,
    templateUrl: './mission-details.component.html',
    imports: [Toast, ConfirmDialog, Tag, TabView, TabPanel, Card, ReactiveFormsModule, NgIf, DropdownModule, GalleriaModule, Divider, MultiSelect, ButtonDirective, InputText],
    providers: [MessageService, ConfirmationService, MissionService, MissionValidationService]
})
export class MissionDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly missionService = inject(MissionService);
    private readonly messageService = inject(MessageService);
    private readonly missionValidationService = inject(MissionValidationService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly fb = inject(FormBuilder);

    // Signals
    loading = signal(true);
    editMode = signal(false);
    mission = signal<MissionResponse | null>(null);

    // État de l'interface
    activeTabIndex = 0;
    images: any[] = [];

    // Constantes
    missionStatusOptions = missionStatus;
    missionTypeOptions = missionTypes;
    missionPriorityOptions = missionPriorities;

    // Formulaire
    missionForm: FormGroup = this.fb.group({
        requesterName: ['', [MissionValidationService.requesterNameValidator()]],
        requesterPhone: ['', [MissionValidationService.requesterPhoneValidator()]],
        vehicleMake: ['', [MissionValidationService.vehicleMakeValidator()]],
        vehicleModel: ['', [MissionValidationService.vehicleModelValidator()]],
        vehiclePlate: ['', [MissionValidationService.vehiclePlateValidator()]],
        pickupAddress: ['', [MissionValidationService.pickupAddressValidator()]],
        destinationAddress: ['', [MissionValidationService.destinationAddressValidator()]],
        missionPriority: ['NORMAL'],
        notes: ['', [MissionValidationService.notesValidator()]],
        missionTypeIds: [[], [MissionValidationService.missionTypesValidator()]],
        hasSignatureException: [false],
        signatureExceptionReason: [''],
        hasVehicleException: [false],
        vehicleExceptionReason: ['']
    });

    ngOnInit(): void {
        this.loadMissionData();
    }

    loadMissionData(): void {
        this.loading.set(true);

        const missionId = this.route.snapshot.paramMap.get('id');
        if (!missionId) {
            this.handleError('ID de mission non trouvé');
            return;
        }

        this.missionService.getMissionById(missionId).subscribe({
            next: (data) => {
                this.mission.set(data);
                this.initializeFormData(data);
                this.loading.set(false);
            },
            error: (error) => {
                this.handleError('Erreur lors du chargement des détails de la mission');
                console.error('Erreur détaillée:', error);
            }
        });
    }

    initializeFormData(mission: MissionResponse): void {
        this.missionForm.patchValue({
            requesterName: mission.requesterName,
            requesterPhone: mission.requesterPhone || '',
            vehicleMake: mission.vehicleMake,
            vehicleModel: mission.vehicleModel || '',
            vehiclePlate: mission.vehiclePlate,
            pickupAddress: mission.pickupAddress,
            destinationAddress: mission.destinationAddress,
            missionPriority: mission.missionPriority,
            notes: mission.notes || '',
            missionTypeIds: mission.missionType.map((type) => type.name)
        });
    }

    toggleEditMode(): void {
        if (this.editMode()) {
            // Si on quitte le mode édition, confirmer ou annuler les changements
            this.confirmationService.confirm({
                message: 'Voulez-vous abandonner les modifications?',
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    // Réinitialiser le formulaire avec les données originales
                    if (this.mission()) {
                        this.initializeFormData(this.mission()!);
                    }
                    this.editMode.set(false);
                },
                reject: () => {
                    // Ne rien faire, rester en mode édition
                }
            });
        } else {
            // Activer le mode édition
            this.editMode.set(true);
        }
    }

    saveMission(): void {
        this.missionForm.markAllAsTouched(); // Marquer tous les champs comme touchés pour afficher les erreurs
        if (this.missionForm.invalid) {
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
            return;
        }

        const missionId = this.route.snapshot.paramMap.get('id');
        if (!missionId) {
            this.handleError('ID de mission non trouvé');
            return;
        }

        const updatedMission = this.missionForm.value;

        this.confirmationService.confirm({
            message: 'Voulez-vous enregistrer ces modifications?',
            header: 'Confirmation',
            icon: 'pi pi-check',
            accept: () => {
                this.loading.set(true);
                console.log('Mission à mettre à jour:', updatedMission);
                this.loading.set(false);
            }
        });
    }

    updateStatus(newStatus: string): void {
        const missionId = this.route.snapshot.paramMap.get('id');
        if (!missionId) {
            this.handleError('ID de mission non trouvé');
            return;
        }

        this.confirmationService.confirm({
            message: `Voulez-vous changer le statut de la mission à "${this.getStatusName(newStatus)}"?`,
            header: 'Confirmation de changement de statut',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.loading.set(true);
                console.log('Changement de statut à:', newStatus);
                this.loading.set(false);
            }
        });
    }

    cancelMission(): void {
        const missionId = this.route.snapshot.paramMap.get('id');
        if (!missionId) {
            this.handleError('ID de mission non trouvé');
            return;
        }

        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir annuler cette mission? Cette action est irréversible.',
            header: 'Annulation de mission',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                // Ici, vous pourriez afficher un dialogue pour saisir la raison de l'annulation
                // Pour simplifier, nous utilisons une raison fixe
                const reason = "Annulation manuelle par l'opérateur";

                this.loading.set(true);
                console.log("Raison de l'annulation:", reason);
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/missions']);
    }

    // Méthodes utilitaires
    getStatusName(statusCode: string): string {
        const status = this.missionStatusOptions.find((s) => s.code === statusCode);
        return status ? status.name : statusCode;
    }

    getTypeName(typeCode: string): string {
        const type = this.missionTypeOptions.find((t) => t.code === typeCode);
        return type ? type.name : typeCode;
    }

    getStatusSeverity(statusCode: string): string {
        switch (statusCode) {
            case 'CREATED':
            case 'ASSIGNED':
                return 'info';
            case 'ACCEPTED':
            case 'EN_ROUTE':
            case 'ARRIVED':
            case 'LOADING':
            case 'IN_TRANSIT':
                return 'warning';
            case 'DELIVERED':
            case 'COMPLETED':
                return 'success';
            case 'REJECTED':
            case 'CANCELLED':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getPrioritySeverity(priorityCode: string): string {
        switch (priorityCode) {
            case 'NORMAL':
                return 'success';
            case 'HIGH':
                return 'warning';
            case 'URGENT':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getTypeSeverity(typeCode: string): string {
        switch (typeCode) {
            case 'TOWING':
                return 'info';
            case 'HOTEL':
                return 'success';
            case 'TAXI':
                return 'warning';
            case 'REPAIR':
                return 'primary';
            case 'FUEL':
                return 'help';
            default:
                return 'secondary';
        }
    }

    private handleError(message: string): void {
        this.loading.set(false);
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: message
        });
        this.router.navigate(['/missions']);
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

    // =====================================================
    // MÉTHODES DE VALIDATION ET AFFICHAGE
    // =====================================================
    // Obtenir le label d'un champ pour l'affichage des erreurs
    getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            requesterName: 'Nom du demandeur',
            requesterPhone: 'Téléphone du demandeur',
            vehicleMake: 'Marque du véhicule',
            vehicleModel: 'Modèle du véhicule',
            vehiclePlate: 'Plaque du véhicule',
            pickupAddress: 'Adresse de ramassage',
            destinationAddress: 'Adresse de destination',
            missionPriority: 'Priorité de la mission',
            notes: 'Notes',
            missionTypeIds: 'Types de mission'
        };
        return labels[fieldName] || fieldName;
    }
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
}
