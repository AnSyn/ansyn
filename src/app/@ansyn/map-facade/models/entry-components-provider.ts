import { InjectionToken, FactoryProvider } from '@angular/core';
import { IEntryComponent } from "../directives/entry-component.directive";

export interface IEntryComponentsEntities {
	status: { new(...args): IEntryComponent }[];
	container: { new(...args): IEntryComponent }[];
}

export const ENTRY_COMPONENTS_ENTITIES = new InjectionToken('ENTRY_COMPONENTS_ENTITIES');

export const ENTRY_COMPONENTS_PROVIDER = new InjectionToken('ENTRY_COMPONENTS_PROVIDER');

export function provideEntryComponentsEntities(value: IEntryComponentsEntities) {
	return {
		provide: ENTRY_COMPONENTS_ENTITIES,
		useValue: value,
		multi: true
	}
}

export function entryComponentsProviderFactory(entryComponentsEntities) {
	return entryComponentsEntities.reduce((prev, next) => ({
			container: [...prev.container, ...next.container],
			status: [...prev.status, ...next.status]
	}), { container: [], status: [] });
}

export const EntryComponentsProvider: FactoryProvider = {
	provide: ENTRY_COMPONENTS_PROVIDER,
	useFactory: entryComponentsProviderFactory,
	deps: [ENTRY_COMPONENTS_ENTITIES]
};
