import { FactoryProvider, InjectionToken } from '@angular/core';

export interface IAlert {
	key: string;
	background?: string;
	text?: string;
	component?: any;
}

export const ALERTS = new InjectionToken<IAlert[]>('Alerts');

export const ALERTS_COLLECTION = new InjectionToken<IAlert[][]>('AlertsCollection');

export function alertsFactory(alertsCollections: IAlert[][] = []): IAlert[] {
	const unique = new Map();
	const alerts = alertsCollections.reduce((prev, next) =>  [...prev, ...next], []);
	alerts.forEach((alert: IAlert) => unique.set(alert.key, alert));
	return Array.from(unique.values());
}

export const AlertsProvider: FactoryProvider = {
	provide: ALERTS,
	useFactory: alertsFactory,
	deps: [ALERTS_COLLECTION]
};

export interface IAlertComponent {
	mapId: string;
}
