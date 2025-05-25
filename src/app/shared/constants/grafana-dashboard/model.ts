export interface DashboardPanel {
    id: string;
    title: string;
    description: string;
    iframeUrl: string;
    width: number;
    height: number;
    category: 'metrics' | 'missions' | 'users' | 'system';
    isLoading?: boolean;
}

export interface RefreshOption {
    label: string;
    value: string;
}
