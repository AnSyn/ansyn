import { FactoryProvider, InjectionToken } from '@angular/core';
import { IEntryComponent } from '../directives/entry-component.directive';


export interface IEntryComponentsEntities {
	status: { new(...args): IEntryComponent }[];
	container: { new(...args): IEntryComponent }[];
}

export const ENTRY_COMPONENTS_ENTITIES = new InjectionToken('ENTRY_COMPONENTS_ENTITIES');

export const ENTRY_COMPONENTS_PROVIDER = new InjectionToken('ENTRY_COMPONENTS_PROVIDER');

/**
 *      @param metadata an object that contain.
 *
 *      status array for Components to inject to the imagery-status.
 *
 *      container array for Components to inject to the map container.
 *
 */
export function provideEntryComponentsEntities(metadata: IEntryComponentsEntities) {
	return {
		provide: ENTRY_COMPONENTS_ENTITIES,
		useValue: metadata,
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
