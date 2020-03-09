import { Injectable } from '@angular/core';
import { OwlDateTimeIntl } from '@ansyn/ng-pick-datetime';
import { TranslateService } from '@ngx-translate/core';

/*
	Link the translation provider of the time picker to the app's translation service (and config)
 */

@Injectable({
	providedIn: 'root'
})
export class TimePickerTranslateService extends OwlDateTimeIntl {
	// See https://danielykpan.github.io/date-time-picker/#locale-formats
	labelsToTranslate = [
		'rangeFromLabel', // From
		'rangeToLabel', // To
		'setBtnLabel', // Set
		'cancelBtnLabel' // Cancel
	];

	constructor(protected translate: TranslateService) {
		super();
		this.labelsToTranslate.forEach(this.searchTranlate.bind(this));
	}

	searchTranlate(label: string) {
		const translation = this.translate.instant(label);
		if (translation !== label) {
			this[label] = translation;
		}
	}
}
