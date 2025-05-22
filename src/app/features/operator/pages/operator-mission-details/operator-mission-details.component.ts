import { Component } from '@angular/core';
import { MissionDetailsComponent } from '../../../missions/components/mission-details/mission-details.component';

@Component({
    selector: 'app-operator-mission-details',
    standalone: true,
    imports: [MissionDetailsComponent],
    template: ` <app-mission-details></app-mission-details>`
})
export class OperatorMissionDetailsComponent {}
