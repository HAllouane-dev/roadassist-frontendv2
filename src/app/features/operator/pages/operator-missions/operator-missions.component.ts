import { Component } from '@angular/core';
import { MissionDataGridComponent } from '../../../missions/components/mission-list/mission-list.component';

@Component({
    selector: 'app-operator-missions',
    standalone: true,
    imports: [MissionDataGridComponent],
    template: ` <app-mission-list></app-mission-list>`
})
export class OperatorMissionsComponent {}
