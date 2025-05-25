import { Component } from '@angular/core';
import { GrafanaDashboardComponent } from '../../../../shared/components/grafana-dashboard/grafana-dashboard.component';

@Component({
    selector: 'app-operator-dashboard',
    standalone: true,
    template: ` <app-grafana-dashboard></app-grafana-dashboard> `,
    imports: [GrafanaDashboardComponent]
})
export class OperatorDashboardComponent {}
