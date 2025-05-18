import { Component, inject, OnInit } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
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

@Component({
    selector: 'app-create-mission-form',
    imports: [InputText, Textarea, FormsModule, DatePickerModule, Toast, Card, Steps, ReactiveFormsModule, NgClass, Tooltip, Calendar, DropdownModule, Panel, DatePipe, Dialog, ButtonDirective, MultiSelect, Chip],
    templateUrl: './create-mission-form.component.html',
    providers: [MessageService]
})
export class CreateMissionFormComponent implements OnInit {
    private readonly fb: FormBuilder = inject(FormBuilder);
    private readonly messageService: MessageService = inject(MessageService);
    missionForm!: FormGroup;
    activeIndex = 0;
    submitted = false;
    loading = false;
    showDialog = false;

    // Options pour les étapes
    steps = [{ label: 'Informations requérant' }, { label: 'Détails véhicule' }, { label: 'Localisation' }, { label: 'Détails mission' }, { label: 'Récapitulatif' }];

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

    ngOnInit() {
        this.initForm();
    }

    // Initialisation du formulaire avec validations
    initForm() {
        this.missionForm = this.fb.group({
            requesterName: ['', Validators.required],
            requesterPhone: ['', Validators.required],
            receivedAt: [new Date(), Validators.required],
            vehicleMake: ['', Validators.required],
            vehicleModel: [''],
            vehiclePlate: ['', Validators.required],
            pickupAddress: ['', Validators.required],
            destinationAddress: ['', Validators.required],
            missionTypes: [[], Validators.required],
            priority: ['NORMAL'],
            notes: ['']
        });
    }

    // Getter pour accéder facilement aux contrôles du formulaire
    get f() {
        return this.missionForm.controls;
    }

    // Changement d'étape via les étapes cliquables
    onActiveIndexChange(event: number) {
        if (event > this.activeIndex) {
            // Validation de l'étape actuelle avant de passer à une suivante
            if (this.validateCurrentStep()) {
                this.activeIndex = event;
            } else {
                this.submitted = true;
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs obligatoires' });
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
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs obligatoires' });
        }
    }

    // Revenir à l'étape précédente
    prevStep() {
        this.activeIndex--;
        this.submitted = false;
    }

    // Validation de l'étape courante
    validateCurrentStep(): boolean {
        switch (this.activeIndex) {
            case 0:
                return this.f['requesterName'].valid && this.f['requesterPhone'].valid && this.f['receivedAt'].valid;
            case 1:
                return this.f['vehicleMake'].valid && this.f['vehiclePlate'].valid;
            case 2:
                return this.f['pickupAddress'].valid && this.f['destinationAddress'].valid;
            case 3:
                return this.f['missionTypes'].valid && this.f['missionTypes'].value.length > 0;
            default:
                return true;
        }
    }

    // Soumission du formulaire
    onSubmit() {
        this.submitted = true;

        if (this.missionForm.valid) {
            this.loading = true;

            // Simulation d'un appel API
            setTimeout(() => {
                this.loading = false;
                this.showDialog = true;
                console.log('Données soumises:', this.missionForm.value);
            }, 1500);
        } else {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez corriger les erreurs avant de soumettre' });
        }
    }

    // Réinitialisation du formulaire pour une nouvelle mission
    resetForm() {
        this.missionForm.reset({
            receivedAt: new Date(),
            priority: 'NORMAL'
        });
        this.activeIndex = 0;
        this.submitted = false;
        this.showDialog = false;
    }

    // Redirection vers les détails de la mission (à implémenter selon la navigation)
    viewMission() {
        this.showDialog = false;
        // Navigation vers les détails (à implémenter)
        console.log('Navigation vers les détails de la mission');
    }

    // Fonctions utilitaires pour l'affichage
    getMissionTypeName(code: string): string {
        const type = this.missionTypes.find((t) => t.code === code);
        return type ? type.name : '';
    }

    getPriorityName(code: string): string {
        const priority = this.priorityOptions.find((p) => p.code === code);
        return priority ? priority.name : 'Normale';
    }

    getFormattedDate(): string {
        const date = new Date();
        return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
    }
}
