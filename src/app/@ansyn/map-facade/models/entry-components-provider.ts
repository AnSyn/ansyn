import { InjectionToken, FactoryProvider } from '@angular/core';

export const ENTRY_COMPONENTS_ENTITIES = new InjectionToken('ENTRY_COMPONENTS_ENTITIES');

export const ENTRY_COMPONENTS_PROVIDER = new InjectionToken('ENTRY_COMPONENTS_PROVIDER');

export function entryComponentsProviderFactory(entryComponentsEntities) {
	return entryComponentsEntities.reduce((prev, next) => [...prev, ...next], []);
}

export const EntryComponentsProvider: FactoryProvider = {
	provide: ENTRY_COMPONENTS_PROVIDER,
	useFactory: entryComponentsProviderFactory,
	deps: [ENTRY_COMPONENTS_ENTITIES]
};
