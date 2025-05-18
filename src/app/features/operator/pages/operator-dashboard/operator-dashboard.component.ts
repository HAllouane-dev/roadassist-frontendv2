import { Component } from '@angular/core';
import { MissionDataGridComponent } from '../../../missions/components/mission-list/mission-list.component';

@Component({
    selector: 'app-operator-dashboard',
    standalone: true,
    imports: [MissionDataGridComponent],
    template: `
        <app-mission-list></app-mission-list>
        <div>
            <iframe
                src="http://localhost:3000/d-solo/39cf0f8c-ed0e-431c-b938-9009cbaddbe1/mission-dashboard?orgId=1&from=1747501051254&to=1747522651254&timezone=browser&panelId=1&__feature.dashboardSceneSolo"
                width="450"
                height="200"
                frameborder="0"
            ></iframe>
        </div>
    `
})
export class OperatorDashboardComponent {}
