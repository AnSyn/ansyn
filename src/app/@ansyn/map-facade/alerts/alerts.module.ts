import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntryComponentDirective } from '../directives/entry-component.directive';
import { ALERTS_COLLECTION, AlertsProvider, IAlert } from './alerts.model';

// @dynamic
@NgModule({
	imports: [CommonModule],
	declarations: [EntryComponentDirective],
	exports: [EntryComponentDirective],
	providers: [AlertsProvider]
})
export class AlertsModule {

	static provideAlerts(alerts: IAlert[]): ModuleWithProviders {
		return {
			ngModule: AlertsModule,
			providers: [
				{ provide: ALERTS_COLLECTION, multi: true, useValue: alerts }
			]
		};
	}
}
