import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MissionService } from '../../services/mission.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MissionResponse } from '../../models/mission.model';
import { missionPriorities, missionStatus, missionTypes } from '../../../../shared/constants/mission/constants';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { DatePipe, NgIf } from '@angular/common';
import { TabPanel, TabView } from 'primeng/tabview';
import { Card } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { Checkbox } from 'primeng/checkbox';
import { GalleriaModule } from 'primeng/galleria';
import { Timeline } from 'primeng/timeline';
import { Divider } from 'primeng/divider';
import { MultiSelect } from 'primeng/multiselect';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-mission-details',
    standalone: true,
    templateUrl: './mission-details.component.html',
    imports: [Toast, ConfirmDialog, Tag, DatePipe, TabView, TabPanel, Card, ReactiveFormsModule, NgIf, DropdownModule, Checkbox, GalleriaModule, Timeline, Divider, MultiSelect, ButtonDirective, InputText],
    providers: [MessageService, ConfirmationService, MissionService]
})
export class MissionDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly missionService = inject(MissionService);
    private readonly messageService = inject(MessageService);
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
        requesterName: ['', Validators.required],
        requesterPhone: [''],
        vehicleMake: ['', Validators.required],
        vehicleModel: [''],
        vehiclePlate: ['', Validators.required],
        pickupAddress: ['', Validators.required],
        destinationAddress: ['', Validators.required],
        missionPriority: ['NORMAL'],
        notes: [''],
        missionTypeIds: [[]],
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
        if (this.missionForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Formulaire invalide',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
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
}
