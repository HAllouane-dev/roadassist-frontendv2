import { Component, inject, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { MissionPriorityFormatted, MissionResponse, MissionStatusFormatted, MissionTypeFormatted, ProviderTypeFormatted } from '../../models/mission.model';
import { MissionService } from '../../services/mission.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { DropdownModule } from 'primeng/dropdown';
import { missionPriorities, missionStatus, missionTypes, providerTypes } from '../../../../shared/constants/mission/constants';
import { Select } from 'primeng/select';
import { Router } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Calendar } from 'primeng/calendar';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: 'app-mission-list',
    standalone: true,
    templateUrl: 'mission-list.component.html',
    imports: [
        TableModule,
        MultiSelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule,
        DropdownModule,
        Select,
        ConfirmDialog,
        Calendar,
        DatePicker
    ],
    providers: [ConfirmationService, MessageService, MissionService]
})
export class MissionDataGridComponent implements OnInit {
    private readonly confirmationService = inject(ConfirmationService);
    private readonly missionService = inject(MissionService);
    private readonly filterService = inject(FilterService);
    private readonly router = inject(Router);
    private readonly loading = signal<boolean>(false);
    @ViewChild('dt1') dt1: Table | undefined;

    rows: number = 10;
    totalRecords: number = 0;
    first: number = 0;

    missions: MissionResponse[] = [];
    missionStatus: MissionStatusFormatted[] = [];
    missionTypes: MissionTypeFormatted[] = [];
    missionPriorities: MissionPriorityFormatted[] = [];
    providerTypes: ProviderTypeFormatted[] = [];

    get isLoading(): Signal<boolean> {
        return this.loading.asReadonly();
    }

    checkIsLoading(): boolean {
        return this.loading();
    }

    ngOnInit(): void {
        this.loadMissionPriorities();
        this.loadMissionStatus();
        this.loadMissionTypes();
        this.loadMissions();
        this.registerCustomFilter();
    }

    onRowClick(mission: MissionResponse): void {
        console.log('click to go details ', mission);
        this.confirmationService.confirm({
            message: `Voulez-vous voir les détails de la mission ${mission.id}?`,
            header: 'Confirmation',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.navigateToMissionDetails(mission.id);
            }
        });
    }

    private navigateToMissionDetails(missionId: string): void {
        console.log('Navigating to mission details for ID:', missionId);

        const url = `/operator/missions/${missionId}`;
        console.log('Navigation URL:', url);

        // Ajoutez des options de navigation pour déboguer
        this.router
            .navigate([url], {
                skipLocationChange: false, // Assurez-vous que l'URL change dans le navigateur
                replaceUrl: false // Ne pas remplacer l'URL actuelle
            })
            .then(
                (success) => console.log('Navigation result:', success),
                (error) => console.error('Navigation error:', error)
            );
    }

    private registerCustomFilter() {
        // Filtre personnalisé pour les tableaux d'objets
        this.filterService.register('custom', (value: any[], filter: any): boolean => {
            console.log('registerCustomFilter', filter, filter);
            if (filter === undefined || filter === null || filter === '') {
                return true;
            }

            if (value === undefined || value === null || value.length === 0) {
                return false;
            }

            // Vérifier si l'un des types correspond au filtre
            console.log('value : ', value);
            console.log('filter : ', filter);
            return value.some((type) => type.name === filter);
        });
    }

    private loadMissionTypes(): void {
        this.missionTypes = missionTypes;
    }

    private loadMissionPriorities(): void {
        this.missionPriorities = missionPriorities;
    }

    private loadMissionStatus(): void {
        this.missionStatus = missionStatus;
    }

    private loadProviderTypes(): void {
        this.providerTypes = providerTypes;
    }

    private loadMissions(): void {
        this.loading.set(true);
        this.missionService.getMissions().subscribe({
            next: (response) => {
                this.missions = response;
                this.totalRecords = response.length;
                this.loading.set(false);
            },
            error: (error) => {
                console.log(error);
                this.loading.set(false);
            }
        });
        this.loading.set(false);
    }

    // Cette méthode est appelée lorsque l'utilisateur sélectionne une option dans le dropdown du filtre
    filterMissionTypes(value: string, filterCallback: Function) {
        if (value) {
            // Appliquer le filtre custom
            console.log('customer filter', value);
            filterCallback(value);
        } else {
            // Réinitialiser le filtre si aucune valeur n'est sélectionnée
            console.log('normal filter', value);
            filterCallback(null);
        }
    }

    onGlobalFilter(event: Event): void {
        if (!this.dt1) return;

        const value = (event.target as HTMLInputElement)?.value || '';
        this.dt1.filterGlobal(value, 'contains');
    }

    clear(): void {
        if (this.dt1) {
            this.dt1.clear();
        }
    }

    getTypeSeverity(typeCode: string): string {
        switch (typeCode) {
            case 'TOWING':
            case 'HOTEL':
            case 'TAXI':
            case 'REPAIR':
            case 'FUEL':
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
}
