import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ALERTS_COLLECTION, AlertsProvider, IAlert } from './alerts.model';
import { AlertsContainerComponent } from './components/alerts-container/alerts-container.component';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		MapFacadeModule.provide({
			entryComponents: {
				container: [],
				status: [AlertsContainerComponent]
			}
		})
	],
	declarations: [AlertsContainerComponent],
	entryComponents: [AlertsContainerComponent],
	exports: [],
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
