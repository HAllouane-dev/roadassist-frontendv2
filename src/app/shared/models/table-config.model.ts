export interface TableColumn<T = any> {
    field: keyof T;
    header: string;
    type: 'text' | 'select' | 'custom' | 'date' | 'tag' | 'multiTag';
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: FilterOption[];
    customeFilterMatchMode?: string;
    minWidth?: string;
    pipe?: string;
    pipeArgs?: any[];
    tagSeverityFunction?: (value: any) => string;
    customTemplate?: boolean;
}

export interface FilterOption {
    name: string;
    code: string;
    [key: string]: any;
}

export interface TableConfig {
    globalFilterFields: string[];
    rowsPerPageOptions: number[];
    defaultRows: number;
    showGridlines?: boolean;
    rowHover?: boolean;
    responsiveLayout: string;
    showClearButton?: boolean;
    showSearchField?: boolean;
    dataKey?: string;
}

export interface TableAction<T = any> {
    label: string;
    icon: string;
    action: (rowData: T) => void;
    condition?: (rowData: T) => boolean;
    severity?: string;
}

export interface TableEvent<T = any> {
    type: 'rowClick' | 'rowSelect' | 'rowUnselect' | 'filter' | 'sort' | 'paginate';
    data?: T;
    value?: any;
}

export interface TableOutput<T = any> {
    onRowClick?: (item: T) => void;
    onRowSelect?: (item: T[]) => void;
    onFilter?: (event: any) => void;
    onSort?: (event: any) => void;
    onPaginate?: (event: any) => void;
}
