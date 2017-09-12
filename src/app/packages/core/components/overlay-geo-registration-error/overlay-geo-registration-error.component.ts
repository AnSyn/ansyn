import { Component, Input } from '@angular/core';

@Component({
	selector: 'ansyn-overlay-geo-registration-error',
	templateUrl: './overlay-geo-registration-error.component.html',
	styleUrls: ['./overlay-geo-registration-error.component.less']
})
export class OverlayGeoRegistrationErrorComponent {
	@Input() showError: boolean;
}
