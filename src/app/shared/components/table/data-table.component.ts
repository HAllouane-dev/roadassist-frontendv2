import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, inject, Inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FilterOption, TableAction, TableColumn, TableConfig } from '../../models/table-config.model';
import { FilterService } from 'primeng/api';

@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    standalone: true,
    imports: [ToastModule, CommonModule, FormsModule, TableModule, ButtonModule, IconFieldModule, InputTextModule, InputIconModule, DropdownModule, SelectModule, TagModule],
    providers: [FilterService]
})
export class DataTableComponent<T = any> {
    private readonly filterService: FilterService = inject(FilterService);

    @ViewChild('dt') dt: Table | undefined;

    // Template pour le contenu personalisé de la table
    @ContentChild('customCell') customCellTemplate: TemplateRef<any> | undefined;
    @ContentChild('customHeader') customFilterTemplate: TemplateRef<any> | undefined;

    // Inputs
    @Input({ required: true }) data: T[] = [];
    @Input({ required: true }) columns: TableColumn<T>[] = [];
    @Input() config: TableConfig = {
        globalFilterFields: [],
        rowsPerPageOptions: [10, 25, 50],
        defaultRows: 10,
        showGridlines: true,
        rowHover: true,
        responsiveLayout: 'scroll',
        showClearButton: true,
        showSearchField: true,
        dataKey: 'id'
    };
    @Input() loading: boolean = false;
    @Input() actions: TableAction<T>[] = [];
    @Input() titre: string = '';
    @Input() searchPlaceHolder: string = 'Rechercher Par Mot Clé';
    @Input() clearButtonLabel: string = 'Vider la liste';

    // Outputs
    @Output() rowClick = new EventEmitter<T>();
    @Output() rowSelect = new EventEmitter<T[]>();
    @Output() filterChange = new EventEmitter<any>();
    @Output() sortChange = new EventEmitter<any>();
    @Output() paginateChange = new EventEmitter<any>();

    // Propriétés internes
    rows: number = 10;
    totalRecords: number = 0;
    first: number = 0;

    ngOnInit(): void {
        this.rows = this.config.defaultRows;
        this.totalRecords = this.data.length;
    }

    ngOnChanges(): void {
        this.totalRecords = this.data.length;
    }

    onRowClick(item: T): void {
        this.rowClick.emit(item);
    }

    onGlobalFilter(event: Event): void {
        if (!this.dt) return;
        const value = (event.target as HTMLInputElement)?.value || '';
        this.dt.filterGlobal(value, 'contains');
    }

    onFilter(event: any, field: string, matchMode: string = 'equals'): void {
        if (!this.dt) return;
        this.dt.filter(event.value, field, matchMode);
        this.filterChange.emit({ field, value: event.value, matchMode });
    }

    onCustomFilter(value: any, filterCallback: Function, column: TableColumn<T>): void {
        if (value !== null && value !== undefined && value !== '') {
            filterCallback(value);
        } else {
            filterCallback(null);
        }
    }

    clear(): void {
        if (this.dt) {
            this.dt.clear();
        }
    }

    getFieldValue(item: T, field: keyof T): any {
        return item[field];
    }

    getTagSeverity(column: TableColumn<T>, value: any): string {
        if (column.tagSeverityFunction) {
            return column.tagSeverityFunction(value);
        }
        return 'secondary';
    }

    shouldShowAction(action: TableAction<T>, item: T): boolean {
        return action.condition ? action.condition(item) : true;
    }

    executeAction(action: TableAction<T>, item: T): void {
        action.action(item);
    }

    private registerCustomFilters(): void {
        // Filtre pour les tableaux d'objets (comme missionType)
        this.filterService.register('arrayContains', (value: any[], filter: any): boolean => {
            if (filter === undefined || filter === null || filter === '') {
                return true;
            }
            if (value === undefined || value === null || value.length === 0) {
                return false;
            }
            return value.some((item) => item.name === filter || item.code === filter);
        });

        // Filtre personnalisé pour les correspondances exactes
        this.filterService.register('exactMatch', (value: any, filter: any): boolean => {
            if (filter === undefined || filter === null || filter === '') {
                return true;
            }
            return value === filter;
        });
    }

    // Méthode utilitaire pour obtenir les options de filtre
    getFilterOptions(column: TableColumn<T>): FilterOption[] {
        return column.filterOptions || [];
    }

    // Méthode pour appliquer un pipe si spécifié
    applyPipe(value: any, column: TableColumn<T>): any {
        if (!column.pipe) return value;

        // Ici vous pourriez implémenter la logique pour appliquer les pipes
        // ou utiliser Angular's Pipe Transform
        switch (column.pipe) {
            case 'date':
                return new Date(value).toLocaleDateString();
            default:
                return value;
        }
    }

    // Méthodes de tracking pour optimiser les performances
    trackByColumn(index: number, column: TableColumn<T>): any {
        return column.field;
    }

    trackByTag(index: number, tag: any): any {
        return tag.code || tag.name || index;
    }

    trackByAction(index: number, action: TableAction<T>): any {
        return action.label || index;
    }
}
