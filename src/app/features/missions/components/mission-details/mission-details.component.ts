import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MissionResponse, MissionUpdateRequest } from '../../models/mission.model';
import { MissionService } from '../../services/mission.service';
import { MissionValidationService } from '../../services/mission.validation.service';
import { DriverResponse } from '../../models/driver.model';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';

interface Signature {
    id: number;
    type: 'DRIVER' | 'CUSTOMER';
    signatureUrl: string;
    signerName: string;
    timestamp: Date;
    notes: string;
}
@Component({
    selector: 'app-mission-details',
    standalone: true,
    templateUrl: './mission-details.component.html',
    imports: [Toast, ConfirmDialog, Tag, TabView, TabPanel, Card, ReactiveFormsModule, FormsModule, DropdownModule, GalleriaModule, Divider, MultiSelect, ButtonDirective, InputText, DialogModule, TimelineModule, TableModule],
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
    showAssignmentModel = signal(false);
    loadingDrivers = signal(false);
    selectedDriver = signal<DriverResponse | null>(null);
    drivers = signal<DriverResponse[]>([]);
    filteredDrivers = signal<DriverResponse[]>([]);

    // Filtres
    selectedZone: string | null = null;
    selectedDriverStatus: string | null = null;

    // Options pour les dropdowns
    zoneOptions = [
        { name: 'Paris Centre', code: 'PARIS_CENTRE' },
        { name: 'Paris Nord', code: 'PARIS_NORD' },
        { name: 'Paris Sud', code: 'PARIS_SUD' },
        { name: 'Lyon Centre', code: 'LYON_CENTRE' },
        { name: 'Marseille Centre', code: 'MARSEILLE_CENTRE' }
    ];

    driverStatusOptions = [
        { name: 'Disponible', code: 'AVAILABLE' },
        { name: 'En mission', code: 'ON_MISSION' },
        { name: 'Indisponible', code: 'UNAVAILABLE' },
        { name: 'En pause', code: 'ON_BREAK' }
    ];

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
        this.loadDrivers();
    }

    // Ouvrir le modèle d'affectation
    openAssignmentModel(): void {
        this.showAssignmentModel.set(true);
    }

    // Fermer le modèle d'affectation
    closeAssignmentModal(): void {
        this.showAssignmentModel.set(false);
        this.selectedDriver.set(null);
        this.selectedZone = null;
        this.selectedDriverStatus = null;
        this.drivers.set([]);
        this.filteredDrivers.set([]);
    }

    // Charger la liste des chauffeurs
    loadDrivers(): void {
        this.loadingDrivers.set(true);

        // TODO: Remplacer par un vrai service
        // Simulation de données pour l'exemple
        setTimeout(() => {
            const mockDrivers: DriverResponse[] = [
                {
                    reference: '1',
                    username: 'pierre.chauffeur',
                    email: 'pierre.chauffeur@example.com',
                    fullName: 'Pierre Chauffeur',
                    status: 'AVAILABLE',
                    zones: 'Paris Centre, Paris Nord',
                    role: 'DRIVER',
                    active: true
                },
                {
                    reference: '2',
                    username: 'sophie.conductrice',
                    email: 'sophie.conductrice@example.com',
                    fullName: 'Sophie Conductrice',
                    status: 'ON_MISSION',
                    zones: 'Paris Centre',
                    role: 'DRIVER',
                    active: true
                },
                {
                    reference: '3',
                    username: 'thomas.depanneur',
                    email: 'thomas.depanneur@example.com',
                    fullName: 'Thomas Dépanneur',
                    status: 'AVAILABLE',
                    zones: 'Paris Sud',
                    role: 'DRIVER',
                    active: true
                }
            ];

            this.drivers.set(mockDrivers);
            this.filterDrivers();
            this.loadingDrivers.set(false);
        }, 1000);
    }

    // Filtrer les chauffeurs selon les critères sélectionnés
    filterDrivers(): void {
        console.log('Filtrage des chauffeurs avec les critères:', {
            status: this.selectedDriverStatus,
            zone: this.selectedZone
        });
        let filtered = this.drivers();

        console.log('Chauffeurs avant filtrage:', filtered);

        if (this.selectedDriverStatus) {
            filtered = filtered.filter((driver) => driver.status === this.selectedDriverStatus);
            console.log('Chauffeurs après filtrage par statut:', filtered);
        }

        if (this.selectedZone) {
            const zoneName = this.zoneOptions.find((option) => option.code === this.selectedZone)?.name;
            console.log('Zone sélectionnée:', zoneName);
            filtered = filtered.filter((driver) => driver.zones?.includes(zoneName!) || false);
            console.log('Chauffeurs après filtrage par zone:', filtered);
        }

        this.filteredDrivers.set(filtered);
        console.log('Chauffeurs filtrés:', this.filteredDrivers());
    }

    // Sélectionner un chauffeur
    selectDriver(driver: DriverResponse): void {
        this.selectedDriver.set(driver);
    }

    assignMissionToDriver(): void {
        const driver = this.selectedDriver();
        const missionId = this.route.snapshot.paramMap.get('id');

        if (!driver || !missionId) {
            this.handleError('Chauffeur ou ID de mission non trouvé');
            return;
        }

        this.confirmationService.confirm({
            message: `Voulez-vous assigner cette mission à ${driver.fullName} (${driver.username})?`,
            header: "Confirmation d'assignation",
            icon: 'pi pi-question-circle',
            accept: () => {
                this.loading.set(true);
                console.log(`Mission ${missionId} assignée à ${driver.fullName} (${driver.username})`);
                // this.missionService.assignDriverToMission(missionId, driver.reference, 'PENDING').subscribe({
                //     next: (response) => {
                //         console.log('Affectation réussie:', response);
                //         this.messageService.add({
                //             severity: 'success',
                //             summary: 'Succès',
                //             detail: `Mission assignée à ${driver.fullName} (${driver.username})`
                //         });
                //         this.mission.set(response.mission);
                //         this.closeAssignmentModal();
                //         this.loading.set(false);
                //     },
                //     error: (error) => {
                //         console.error("Erreur lors de l'affectation:", error);
                //         this.messageService.add({
                //             severity: 'error',
                //             summary: 'Erreur',
                //             detail: "Erreur lors de l'affectation du chauffeur à la mission"
                //         });
                //         this.loading.set(false);
                //         this.closeAssignmentModal();
                //     }
                // });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Mission assignée à ${driver.fullName} (${driver.username})`
                });
                const currentMission = this.mission();
                if (currentMission) {
                    this.mission.set({
                        ...currentMission,
                        MissionStatus: 'ASSIGNED'
                    });
                }
                this.loading.set(false);
                this.closeAssignmentModal();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulation',
                    detail: 'Affectation annulée'
                });
                this.closeAssignmentModal();
            }
        });
    }

    // obtenir le label du status chauffeur
    getDriverStatusLabel(status: string): string {
        const statusOption = this.driverStatusOptions.find((s) => s.code === status);
        return statusOption ? statusOption.name : status;
    }

    // obtenir la sévérité du status chauffeur
    getDriverStatusSeverity(status: string): string {
        switch (status) {
            case 'AVAILABLE':
                return 'success';
            case 'ON_MISSION':
                return 'warning';
            case 'UNAVAILABLE':
                return 'danger';
            case 'ON_BREAK':
                return 'info';
            default:
                return 'secondary';
        }
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
                this.missionService.updateMission(missionId, this.buildMissionUpdateRequest()).subscribe({
                    next: (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Mission mise à jour avec succès'
                        });
                        this.mission.set(response);
                        this.editMode.set(false);
                        this.loading.set(false);
                    },
                    error: (error) => {
                        this.handleError('Erreur lors de la mise à jour de la mission');
                        console.error('Erreur détaillée:', error);
                    }
                });
            },
            reject: () => {
                // Ne rien faire, rester en mode édition
                this.editMode.set(true);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulation',
                    detail: 'Modifications annulées'
                });
                // Réinitialiser le formulaire avec les données originales
                if (this.mission()) {
                    this.initializeFormData(this.mission()!);
                }
                // Assurez-vous de quitter le mode édition
                this.editMode.set(false);
                // Réinitialiser l'état de chargement
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
                this.openAssignmentModel(); // Ouvrir le modèle d'affectation si nécessaire
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

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            CREATED: '#6c757d',
            ASSIGNED: '#17a2b8',
            ACCEPTED: '#28a745',
            EN_ROUTE: '#007bff',
            ARRIVED: '#ffc107',
            LOADING: '#fd7e14',
            IN_TRANSIT: '#20c997',
            DELIVERED: '#6f42c1',
            COMPLETED: '#28a745',
            CANCELLED: '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    getStatusIcon(status: string): string {
        const icons: { [key: string]: string } = {
            CREATED: 'pi pi-file',
            ASSIGNED: 'pi pi-user',
            ACCEPTED: 'pi pi-check',
            EN_ROUTE: 'pi pi-car',
            ARRIVED: 'pi pi-map-marker',
            LOADING: 'pi pi-truck',
            IN_TRANSIT: 'pi pi-directions',
            DELIVERED: 'pi pi-flag',
            COMPLETED: 'pi pi-check-circle',
            CANCELLED: 'pi pi-times-circle'
        };
        return icons[status] || 'pi pi-circle';
    }

    getStatusLabel(status: string): string {
        const names: { [key: string]: string } = {
            CREATED: 'Créée',
            ASSIGNED: 'Assignée',
            ACCEPTED: 'Acceptée',
            EN_ROUTE: 'En route',
            ARRIVED: 'Arrivé',
            LOADING: 'Chargement',
            IN_TRANSIT: 'En transit',
            DELIVERED: 'Livré',
            COMPLETED: 'Terminée',
            CANCELLED: 'Annulée'
        };
        return names[status] || status;
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

    private buildMissionUpdateRequest(): MissionUpdateRequest {
        const formValue = this.missionForm.value;
        return {
            requesterName: formValue.requesterName,
            requesterPhone: formValue.requesterPhone,
            vehicleMake: formValue.vehicleMake,
            vehicleModel: formValue.vehicleModel,
            vehiclePlate: formValue.vehiclePlate,
            pickupAddress: formValue.pickupAddress,
            destinationAddress: formValue.destinationAddress,
            missionPriority: formValue.missionPriority,
            notes: formValue.notes,
            missionType: formValue.missionTypeIds.map((type: string) => ({ name: type }))
        };
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

    // Données mockées pour les photos
    mockPhotosPreLoading = [
        {
            id: 1,
            url: 'https://media.ooreka.fr/public/image/voiture-accident-epave-casse-full-12852839.jpg',
            description: 'Vue de face',
            timestamp: new Date(2024, 11, 19, 14, 30),
            location: "Place de l'Hôtel de Ville, Paris",
            type: 'PRE_LOADING'
        },
        {
            id: 2,
            url: 'https://lvdneng.rosselcdn.net/sites/default/files/dpistyles_v2/ena_16_9_extra_big/2020/10/08/node_876324/49221783/public/2020/10/08/B9724857000Z.1_20201008143254_000%2BGOEGR2502.1-0.jpg?itok=Kf66gdjf1602166808',
            description: 'Vue arrière',
            timestamp: new Date(2024, 11, 19, 14, 31),
            location: "Place de l'Hôtel de Ville, Paris",
            type: 'PRE_LOADING'
        },
        {
            id: 3,
            url: 'https://th.bing.com/th/id/OIP.wr9DGQ-GRx_WeDsGYS1u4AHaE8?rs=1&pid=ImgDetMain',
            description: 'Côté gauche',
            timestamp: new Date(2024, 11, 19, 14, 32),
            location: "Place de l'Hôtel de Ville, Paris",
            type: 'PRE_LOADING'
        },
        {
            id: 4,
            url: 'https://th.bing.com/th/id/OIP.4-4aQiJJUEfLTSwJd3eRzAHaE8?w=1200&h=800&rs=1&pid=ImgDetMain',
            description: 'Côté droit',
            timestamp: new Date(2024, 11, 19, 14, 33),
            location: "Place de l'Hôtel de Ville, Paris",
            type: 'PRE_LOADING'
        }
    ];

    mockPhotosLoading = [
        {
            id: 5,
            url: 'https://static.vecteezy.com/ti/photos-gratuite/p2/8004427-voiture-accidentee-chargee-sur-une-depanneuse-dommage-vehicule-apres-accident-accident-sur-ville-rue-photo.jpg',
            description: 'Véhicule sur la dépanneuse',
            timestamp: new Date(2024, 11, 19, 15, 15),
            location: "Place de l'Hôtel de Ville, Paris",
            type: 'LOADING'
        }
    ];

    mockPhotosPostDelivery = [
        {
            id: 6,
            url: 'https://th.bing.com/th/id/R.50e419a9cf8a70d022ab1bb14e3ded84?rik=fuGcityYf0bE7w&pid=ImgRaw&r=0',
            description: 'Vue de face - livraison',
            timestamp: new Date(2024, 11, 19, 16, 45),
            location: 'Avenue de Clichy, Paris',
            type: 'POST_DELIVERY'
        },
        {
            id: 7,
            url: 'https://th.bing.com/th/id/R.50e419a9cf8a70d022ab1bb14e3ded84?rik=fuGcityYf0bE7w&pid=ImgRaw&r=0',
            description: 'Vue arrière - livraison',
            timestamp: new Date(2024, 11, 19, 16, 46),
            location: 'Avenue de Clichy, Paris',
            type: 'POST_DELIVERY'
        },
        {
            id: 8,
            url: 'https://th.bing.com/th/id/R.50e419a9cf8a70d022ab1bb14e3ded84?rik=fuGcityYf0bE7w&pid=ImgRaw&r=0',
            description: 'État final du véhicule',
            timestamp: new Date(2024, 11, 19, 16, 47),
            location: 'Avenue de Clichy, Paris',
            type: 'POST_DELIVERY'
        }
    ];

    mockStatusHistory = [
        {
            status: 'CREATED',
            timestamp: new Date(2024, 11, 19, 13, 0),
            user: 'Jean Opérateur',
            notes: "Mission créée suite à l'appel client",
            location: null
        },
        {
            status: 'ASSIGNED',
            timestamp: new Date(2024, 11, 19, 13, 15),
            user: 'Jean Opérateur',
            notes: 'Mission assignée à Pierre Chauffeur',
            location: null
        },
        {
            status: 'ACCEPTED',
            timestamp: new Date(2024, 11, 19, 13, 20),
            user: 'Pierre Chauffeur',
            notes: 'Mission acceptée par le chauffeur',
            location: null
        },
        {
            status: 'EN_ROUTE',
            timestamp: new Date(2024, 11, 19, 13, 25),
            user: 'Pierre Chauffeur',
            notes: "En route vers le lieu d'intervention",
            location: 'Garage Central, Paris'
        },
        {
            status: 'ARRIVED',
            timestamp: new Date(2024, 11, 19, 14, 30),
            user: 'Pierre Chauffeur',
            notes: "Arrivé sur le lieu d'intervention",
            location: "Place de l'Hôtel de Ville, Paris"
        },
        {
            status: 'LOADING',
            timestamp: new Date(2024, 11, 19, 15, 15),
            user: 'Pierre Chauffeur',
            notes: 'Chargement du véhicule en cours',
            location: "Place de l'Hôtel de Ville, Paris"
        },
        {
            status: 'IN_TRANSIT',
            timestamp: new Date(2024, 11, 19, 15, 45),
            user: 'Pierre Chauffeur',
            notes: 'En transit vers la destination',
            location: 'Boulevard Saint-Michel, Paris'
        },
        {
            status: 'DELIVERED',
            timestamp: new Date(2024, 11, 19, 16, 45),
            user: 'Pierre Chauffeur',
            notes: 'Véhicule livré à destination',
            location: 'Avenue de Clichy, Paris'
        },
        {
            status: 'COMPLETED',
            timestamp: new Date(2024, 11, 19, 17, 0),
            user: 'Pierre Chauffeur',
            notes: 'Mission terminée avec succès, signatures recueillies',
            location: 'Avenue de Clichy, Paris'
        }
    ];

    // Données mockées pour le chauffeur
    mockCurrentDriver = {
        reference: 'DRV-2025-001',
        fullName: 'Pierre Chauffeur',
        email: 'pierre.chauffeur@roadassist.com',
        phone: '+33604050607',
        status: 'ON_MISSION',
        zone: 'Paris Centre',
        assignedAt: new Date(2024, 11, 19, 13, 15),
        acceptedAt: new Date(2024, 11, 19, 13, 20)
    };

    // Statistiques du chauffeur
    mockDriverStats = {
        totalMissions: 147,
        completedMissions: 142,
        averageRating: 4.8,
        responseTime: 12
    };

    // Historique des assignations
    mockAssignmentHistory = [
        {
            driverName: 'Pierre Chauffeur',
            action: 'ASSIGNED',
            timestamp: new Date(2024, 11, 19, 13, 15),
            status: 'ACCEPTED',
            notes: 'Assignation initiale',
            assignedBy: 'Jean Opérateur'
        },
        {
            driverName: 'Sophie Conductrice',
            action: 'UNASSIGNED',
            timestamp: new Date(2024, 11, 19, 13, 10),
            status: 'REJECTED',
            notes: 'Chauffeur indisponible - en mission',
            assignedBy: 'Jean Opérateur'
        }
    ];

    // Données mockées pour les signatures
    mockSignatures: Signature[] = [
        {
            id: 1,
            type: 'DRIVER',
            signatureUrl: 'https://th.bing.com/th/id/OIP.N-DME1_QlRohlzmTfDfkSQHaDb?w=309&h=161&c=7&r=0&o=7&pid=1.7&rm=3',
            signerName: 'Pierre Chauffeur',
            timestamp: new Date(2024, 11, 19, 17, 0),
            notes: 'Signature électronique du chauffeur'
        },
        {
            id: 2,
            type: 'CUSTOMER',
            signatureUrl: 'https://th.bing.com/th/id/OIP.LBUr_QRVNCPsENkdyN7sgAHaE1?w=243&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
            signerName: 'Antoine Dupont',
            timestamp: new Date(2024, 11, 19, 17, 2),
            notes: 'Signature du client - véhicule livré en bon état'
        }
    ];

    getSignaturesByType(type: string): Signature[] {
        switch (type) {
            case 'DRIVER':
                return this.mockSignatures.filter((s) => s.type === 'DRIVER');
            case 'CUSTOMER':
                return this.mockSignatures.filter((s) => s.type === 'CUSTOMER');
            default:
                return [];
        }
    }

    // Méthodes pour les modals
    openPhotoModal(photo: any): void {
        // Logique pour ouvrir le modal de photo
        console.log('Opening photo modal for:', photo);
        // Vous pouvez implémenter un modal ou une lightbox ici
    }

    openSignatureModal(signature: any): void {
        // Logique pour ouvrir le modal de signature
        console.log('Opening signature modal for:', signature);
        // Vous pouvez implémenter un modal pour voir la signature en grand
    }

    // Méthodes utilitaires supplémentaires si nécessaire
    downloadSignaturePDF(): void {
        console.log('Downloading signature PDF...');
        // Logique pour télécharger le PDF
    }

    sendSignatureByEmail(): void {
        console.log('Sending signature by email...');
        // Logique pour envoyer par email
    }

    getDriverStatusv2Severity(status: string): string {
        const severities: { [key: string]: string } = {
            AVAILABLE: 'success',
            ON_MISSION: 'warning',
            UNAVAILABLE: 'danger',
            ON_BREAK: 'info'
        };
        return severities[status] || 'secondary';
    }

    getAssignmentActionSeverity(action: string): string {
        const severities: { [key: string]: string } = {
            ASSIGNED: 'info',
            UNASSIGNED: 'warning',
            REASSIGNED: 'success'
        };
        return severities[action] || 'secondary';
    }
}
