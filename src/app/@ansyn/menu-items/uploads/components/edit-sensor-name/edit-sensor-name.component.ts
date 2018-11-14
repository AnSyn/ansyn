import { Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'ansyn-edit-sensor-name',
	templateUrl: './edit-sensor-name.component.html',
	styleUrls: ['./edit-sensor-name.component.less']
})
export class EditSensorNameComponent {
	@Output() onSubmit = new EventEmitter<string>();

	submit(value) {
		this.onSubmit.emit(value);
	}

}
