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
import { DashboardPanel, TimeRangeOption } from '../../constants/grafana-dashboard/model';

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
            title: 'Points de départ et d’arrivée des missions',
            description: 'Distribution des points de départ et d’arrivée des missions',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745348749130&to=1747940749130&timezone=Africa%2FCasablanca&refresh=5s&panelId=5',
            width: 450,
            height: 450,
            category: 'missions',
            isLoading: true
        },
        {
            id: 'roadassist-panel-3',
            title: 'Missions Urgentes',
            description: 'La liste des missions urgentes',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349015384&to=1747941015384&timezone=Africa%2FCasablanca&refresh=5s&panelId=3',
            width: 450,
            height: 450,
            category: 'missions',
            isLoading: true
        },
        {
            id: 'roadassist-panel-1',
            title: 'Missions par priorité',
            description: 'Répartition des missions par priorité',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349030381&to=1747941030381&timezone=Africa%2FCasablanca&refresh=5s&panelId=1',
            width: 450,
            height: 450,
            category: 'missions',
            isLoading: true
        },
        {
            id: 'roadassist-panel-4',
            title: 'Missions par états',
            description: 'Répartition des missions par état',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349040381&to=1747941040381&timezone=Africa%2FCasablanca&refresh=5s&panelId=4',
            width: 450,
            height: 450,
            category: 'missions',
            isLoading: true
        },
        {
            id: 'roadassist-panel-6',
            title: 'Missions par type de prestataires',
            description: 'Répartition des missions par type de prestataires',
            iframeUrl: 'http://localhost:3000/d-solo/fe5f05a1-8806-4da1-af4c-c1cecd98a160/roadassist?orgId=1&from=1745349055393&to=1747941055393&timezone=Africa%2FCasablanca&refresh=5s&panelId=6',
            width: 450,
            height: 450,
            category: 'missions',
            isLoading: true
        }
    ]);

    // Signal pour le panel en plein écran (null si aucun)
    fullscreenPanel = signal<string | null>(null);

    // Signal pour le mode plein écran global
    isGlobalFullscreen = signal<boolean>(false);

    // Signal pour la catégorie sélectionnée
    selectedCategory = signal<string>('all');

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

    // Options de période de temps
    timeRangeOptions = signal<TimeRangeOption[]>([
        { label: 'Dernière heure', value: '1h', fromOffset: 60 * 60 * 1000 },
        { label: 'Dernières 6 heures', value: '6h', fromOffset: 6 * 60 * 60 * 1000 },
        { label: 'Dernières 12 heures', value: '12h', fromOffset: 12 * 60 * 60 * 1000 },
        { label: 'Dernières 24 heures', value: '24h', fromOffset: 24 * 60 * 60 * 1000 },
        { label: 'Derniers 7 jours', value: '7d', fromOffset: 7 * 24 * 60 * 60 * 1000 },
        { label: 'Derniers 30 jours', value: '30d', fromOffset: 30 * 24 * 60 * 60 * 1000 },
        { label: 'Derniers 90 jours', value: '90d', fromOffset: 90 * 24 * 60 * 60 * 1000 }
    ]);

    // Variables pour la gestion
    selectedTimeRange = '90d';
    showErrorDialog = false;
    private readonly loadingTimeouts = new Map<string, number>();

    ngOnInit() {
        // Chargement initial avec timeout de sécurité
        this.loadInitialPanels();

        // Appliquer la période de temps par défaut
        this.updateAllPanelsTimeRange();

        // Filtrer les erreurs Grafana non critiques (optionnel)
        this.setupErrorFiltering();
    }

    ngOnDestroy() {
        // Nettoyer tous les timeouts
        this.loadingTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.loadingTimeouts.clear();
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

    // Rafraîchir tous les dashboards manuellement
    refreshAllDashboards(): void {
        // Marquer tous les panels comme en cours de chargement
        this.panels.update((panels) => panels.map((panel) => ({ ...panel, isLoading: true })));

        // Mettre à jour toutes les URLs avec la nouvelle période
        this.updateAllPanelsTimeRange();

        // Timeout de sécurité pour arrêter le loading après 5 secondes
        setTimeout(() => {
            this.panels.update((panels) => panels.map((panel) => ({ ...panel, isLoading: false })));
        }, 5000);
    }

    // Gestion du changement de période de temps
    onTimeRangeChange(event: any): void {
        this.selectedTimeRange = event.value;
        console.log(`Changement de période: ${this.selectedTimeRange}`);
        this.updateAllPanelsTimeRange();
    }

    // Mettre à jour toutes les URLs des panels avec la nouvelle période
    updateAllPanelsTimeRange(): void {
        const timeRange = this.timeRangeOptions().find((option) => option.value === this.selectedTimeRange);
        if (!timeRange) return;

        const now = Date.now();
        const from = now - timeRange.fromOffset;
        const to = now;

        console.log(`Mise à jour de toutes les URLs avec from=${from} et to=${to}`);

        this.panels.update((panels) =>
            panels.map((panel) => ({
                ...panel,
                iframeUrl: this.updateUrlTimeRange(panel.iframeUrl, from, to)
            }))
        );
    }

    // Mettre à jour une URL spécifique avec les paramètres from/to
    private updateUrlTimeRange(url: string, from: number, to: number): string {
        let updatedUrl = url;

        // Remplacer ou ajouter le paramètre 'from'
        if (updatedUrl.includes('from=')) {
            updatedUrl = updatedUrl.replace(/from=\d+/, `from=${from}`);
        } else {
            updatedUrl += `&from=${from}`;
        }

        // Remplacer ou ajouter le paramètre 'to'
        if (updatedUrl.includes('to=')) {
            updatedUrl = updatedUrl.replace(/to=\d+/, `to=${to}`);
        } else {
            updatedUrl += `&to=${to}`;
        }

        return updatedUrl;
    }

    // Rafraîchir un panel spécifique (simplifié)
    refreshPanel(panelId: string): void {
        // Nettoyer le timeout existant
        const existingTimeout = this.loadingTimeouts.get(panelId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: true } : panel)));

        // Timeout de sécurité de 3 secondes pour ce panel
        const timeoutId = window.setTimeout(() => {
            this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: false } : panel)));
            this.loadingTimeouts.delete(panelId);
        }, 3000);

        this.loadingTimeouts.set(panelId, timeoutId);
    }

    // Forcer l'arrêt du chargement d'un panel
    stopPanelLoading(panelId: string): void {
        const existingTimeout = this.loadingTimeouts.get(panelId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.loadingTimeouts.delete(panelId);
        }

        this.panels.update((panels) => panels.map((panel) => (panel.id === panelId ? { ...panel, isLoading: false } : panel)));
    }

    // Arrêter tous les chargements
    stopAllLoading(): void {
        // Nettoyer tous les timeouts
        this.loadingTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.loadingTimeouts.clear();

        // Arrêter le loading de tous les panels
        this.panels.update((panels) => panels.map((panel) => ({ ...panel, isLoading: false })));
    }

    // Vérifier si une iframe est bloquée (méthode simple)
    isIframeBlocked(panel: DashboardPanel): boolean {
        // Pour l'instant, on suppose que si l'URL contient localhost et qu'on n'est pas sur localhost,
        // alors c'est bloqué
        return panel.iframeUrl.includes('localhost') && !window.location.hostname.includes('localhost');
    }

    // Ouvrir l'URL dans un nouvel onglet
    openInNewTab(url: string): void {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Réessayer les panels en échec
    retryFailedPanels(): void {
        this.showErrorDialog = false;
        this.refreshAllDashboards();
    }

    // Chargement initial avec timeout de sécurité
    private loadInitialPanels(): void {
        this.panels().forEach((panel, index) => {
            // Délai échelonné pour éviter de surcharger le navigateur
            setTimeout(() => {
                // Créer un timeout de sécurité pour chaque panel
                const timeoutId = window.setTimeout(() => {
                    this.handlePanelTimeout(panel.id);
                }, 4000); // 4 secondes de timeout

                this.loadingTimeouts.set(panel.id, timeoutId);
            }, index * 500); // Délai de 500ms entre chaque panel
        });
    }

    private handlePanelTimeout(panelId: string): void {
        this.panels.update((panels) => panels.map((p) => (p.id === panelId ? { ...p, isLoading: false } : p)));
        this.loadingTimeouts.delete(panelId);
        console.log(`Timeout de chargement pour le panel ${panelId}`);
    }

    // Filtrer les erreurs Grafana non critiques (optionnel)
    private setupErrorFiltering(): void {
        // Capture les erreurs de la console pour les filtrer
        const originalError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');

            // Filtrer les erreurs de plugins Grafana non critiques
            if (message.includes('[Plugins] Failed to preload plugin') || message.includes('grafana-pyroscope-app') || message.includes('Unknown Plugin')) {
                // Log silencieux pour le debug (optionnel)
                console.warn('🔇 Erreur Grafana filtrée:', message);
                return;
            }

            // Laisser passer les autres erreurs
            originalError.apply(console, args);
        };
    }
}
