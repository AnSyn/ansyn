import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponentDirective } from './alert-component.directive';
import { ALERTS_COLLECTION, AlertsProvider, IAlert } from '@ansyn/core/alerts/alerts.model';

@NgModule({
	imports: [CommonModule],
	declarations: [AlertComponentDirective],
	exports: [AlertComponentDirective],
	providers: [AlertsProvider]
})
export class AlertsModule {

	static provideAlerts(alerts: IAlert[]): ModuleWithProviders {
		return {
			ngModule: AlertsModule,
			providers: [
				{ provide: ALERTS_COLLECTION, multi: true, useValue: alerts }
			]
		}
	}
}
