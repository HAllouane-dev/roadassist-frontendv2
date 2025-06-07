import { Component } from '@angular/core';
import { CreateMissionFormComponent } from '../../../missions/components/create-mission-form/create-mission-form.component';

@Component({
    selector: 'app-operator-create-mission',
    imports: [CreateMissionFormComponent],
    template: ` <app-create-mission-form></app-create-mission-form>`
})
export class CreateMissionComponent {}
