import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardPanel, RefreshOption } from '../../constants/grafana-dashboard/model';

@Component({
    selector: 'app-grafana-dashboard',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ToolbarModule, DropdownModule, InputTextModule, DialogModule, DividerModule, SkeletonModule, TooltipModule, FormsModule],
    templateUrl: 'grafana-dashboard.component.html',
    styleUrls: ['grafana-dashboard.component.scss']
})
export class GrafanaDashboardComponent implements OnInit, OnDestroy {
    // Injection du DomSanitizer pour sécuriser les URLs des iframes
    private readonly sanitizer = inject(DomSanitizer);

    // ⭐ SIGNALS - Pourquoi utiliser les signals ?
    // Les signals sont la nouvelle façon de gérer la réactivité dans Angular 19
    // Ils offrent une meilleure performance et une syntaxe plus simple que les Observables
    // pour la gestion d'état local

    // Signal pour stocker la liste des panels de dashboard
    panels = signal<DashboardPanel[]>([
        {
            id: 'roadassist-panel-5',
            title: 'Métriques Système',
            description: 'Distribution des points de destination et des missions',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745348749130&to=1747940749130&timezone=Africa%2FCasablanca&refresh=5s&panelId=5',
            width: 450,
            height: 300,
            category: 'system',
            isLoading: true
        },
        {
            id: 'roadassist-panel-3',
            title: 'Métriques Missions Urgentes',
            description: 'La liste des missions urgentes',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349015384&to=1747941015384&timezone=Africa%2FCasablanca&refresh=5s&panelId=3',
            width: 450,
            height: 300,
            category: 'metrics',
            isLoading: true
        },
        {
            id: 'roadassist-panel-1',
            title: 'Métriques Missions Par Priorité',
            description: 'Nombre de missions par priorité',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349030381&to=1747941030381&timezone=Africa%2FCasablanca&refresh=5s&panelId=1',
            width: 450,
            height: 300,
            category: 'metrics',
            isLoading: true
        },
        {
            id: 'roadassist-panel-4',
            title: 'Métriques Missions par État',
            description: 'Nombre de missions par type état',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349040381&to=1747941040381&timezone=Africa%2FCasablanca&refresh=5s&panelId=4',
            width: 450,
            height: 300,
            category: 'metrics',
            isLoading: true
        },
        {
            id: 'roadassist-panel-6',
            title: 'Métriques Missions par Provider',
            description: 'Nombre de missions par type de provider',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349055393&to=1747941055393&timezone=Africa%2FCasablanca&refresh=5s&panelId=6',
            width: 450,
            height: 300,
            category: 'metrics',
            isLoading: true
        }
    ]);

    // Signal pour le panel en plein écran (null si aucun)
    fullscreenPanel = signal<string | null>(null);

    // Signal pour le mode plein écran global
    isGlobalFullscreen = signal<boolean>(false);

    // Signal pour la catégorie sélectionnée
    selectedCategory = signal<string>('all');

    // Signal pour l'état de rafraîchissement
    isRefreshing = signal<boolean>(false);

    // ⭐ COMPUTED - Pourquoi utiliser computed ?
    // computed() crée une valeur dérivée qui se met à jour automatiquement
    // quand ses dépendances changent. C'est plus performant que d'utiliser
    // des getters car Angular peut optimiser les recalculs

    // Computed pour filtrer les panels selon la catégorie sélectionnée
    filteredPanels = computed(() => {
        const category = this.selectedCategory();
        const allPanels = this.panels();

        if (category === 'all') {
            return allPanels;
        }

        return allPanels.filter((panel) => panel.category === category);
    });

    // Computed pour les catégories disponibles
    categories = computed(() => [
        { label: 'Tout', value: 'all' },
        { label: 'Métriques', value: 'metrics' },
        { label: 'Missions', value: 'missions' },
        { label: 'Utilisateurs', value: 'users' },
        { label: 'Système', value: 'system' }
    ]);

    // Options de rafraîchissement
    refreshOptions = signal<RefreshOption[]>([
        { label: '5 secondes', value: '5s' },
        { label: '10 secondes', value: '10s' },
        { label: '30 secondes', value: '30s' },
        { label: '1 minute', value: '1m' },
        { label: '5 minutes', value: '5m' }
    ]);

    // Variables pour la gestion
    selectedRefresh = '30s';
    showErrorDialog = false;
    private refreshInterval?: number;

    ngOnInit() {
        // Simulation du chargement initial des panels
        this.simulateInitialLoading();

        // Démarrer le rafraîchissement automatique
        this.startAutoRefresh();
    }

    ngOnDestroy() {
        // Nettoyer l'intervalle de rafraîchissement
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    // ⭐ Pourquoi cette méthode ?
    // trackBy améliore les performances en aidant Angular à identifier
    // quels éléments ont changé dans la liste *ngFor
    trackByPanelId(index: number, panel: DashboardPanel): string {
        return panel.id;
    }

    // Méthode pour obtenir une URL sécurisée (protection XSS)
    getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    // Gestion du plein écran pour un panel spécifique
    togglePanelFullscreen(panelId: string): void {
        const current = this.fullscreenPanel();
        this.fullscreenPanel.set(current === panelId ? null : panelId);
    }

    // Gestion du plein écran global
    toggleGlobalFullscreen(): void {
        this.isGlobalFullscreen.update((current) => !current);
        // Réinitialiser le plein écran individuel si activé
        if (this.isGlobalFullscreen()) {
            this.fullscreenPanel.set(null);
        }
    }

    // Changer la catégorie sélectionnée
    setSelectedCategory(category: string): void {
        this.selectedCategory.set(category);
    }

    // Calculer le nombre de colonnes de grille pour un panel
    getGridColumns(panel: DashboardPanel): number {
        if (this.fullscreenPanel() === panel.id || this.isGlobalFullscreen()) {
            return 12; // Pleine largeur
        }

        // Logique responsive basée sur la catégorie
        switch (panel.category) {
            case 'metrics':
                return 6; // 2 colonnes sur 12
            case 'missions':
                return 8; // Plus large pour les données importantes
            default:
                return 6;
        }
    }

    // Calculer la hauteur d'un panel
    getPanelHeight(panel: DashboardPanel): number {
        if (this.fullscreenPanel() === panel.id) {
            return window.innerHeight - 200; // Hauteur maximale moins les marges
        }

        if (this.isGlobalFullscreen()) {
            return 600; // Hauteur fixe en mode global
        }

        return panel.height || 400; // Hauteur par défaut
    }

    // Rafraîchir tous les dashboards
    refreshAllDashboards(): void {
        this.isRefreshing.set(true);

        // Marquer tous les panels comme en cours de chargement
        this.panels.update((panels) => panels.map((panel) => ({ ...panel, isLoading: true })));

        // Simuler le rafraîchissement (dans un vrai projet, ici on rechargerait les iframes)
        setTimeout(() => {
            this.panels.update((panels) => panels.map((panel) => ({ ...panel, isLoading: false })));
            this.isRefreshing.set(false);
        }, 2000);
    }

    // Rafraîchir un panel spécifique
    refreshPanel(panelId: string): void {
        this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: true } : panel)));

        // Simuler le chargement
        setTimeout(() => {
            this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: false } : panel)));
        }, 1500);
    }

    // Gestion du changement d'intervalle de rafraîchissement
    onRefreshChange(event: any): void {
        this.selectedRefresh = event.value;
        this.startAutoRefresh();
    }

    // Callback quand une iframe se charge
    onIframeLoad(panelId: string): void {
        this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: false } : panel)));
    }

    // Callback en cas d'erreur de chargement d'iframe
    onIframeError(panelId: string): void {
        this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: false } : panel)));
        this.showErrorDialog = true;
    }

    // Réessayer les panels en échec
    retryFailedPanels(): void {
        this.showErrorDialog = false;
        this.refreshAllDashboards();
    }

    // Simulation du chargement initial
    private simulateInitialLoading(): void {
        // Charger les panels un par un avec un délai
        this.panels().forEach((panel, index) => {
            setTimeout(
                () => {
                    this.setPanelLoadingFalse(panel.id);
                },
                (index + 1) * 800
            );
        });
    }

    // Méthode pour mettre à jour isLoading à false pour un panel donné
    private setPanelLoadingFalse(panelId: string): void {
        this.panels.update((panels) => panels.map((p) => (p.id === panelId ? { ...p, isLoading: false } : p)));
    }

    // Démarrer le rafraîchissement automatique
    private startAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        const intervalMs = this.parseRefreshInterval(this.selectedRefresh);
        console.log(`Démarrage du rafraîchissement automatique toutes les ${intervalMs} ms`);
        if (intervalMs > 0) {
            this.refreshInterval = window.setInterval(() => {
                this.refreshAllDashboards();
            }, intervalMs);
        }
    }

    // Convertir l'intervalle en millisecondes
    private parseRefreshInterval(interval: string): number {
        const num = parseInt(interval);
        if (interval.endsWith('s')) return num * 1000;
        if (interval.endsWith('m')) return num * 60 * 1000;
        return 0;
    }
}
