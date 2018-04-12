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
	return alertsCollections.reduce((prev, next) =>  [...prev, ...next], []);
}

export const AlertsProvider: FactoryProvider = {
	provide: ALERTS,
	useFactory: alertsFactory,
	deps: [ALERTS_COLLECTION]
};

