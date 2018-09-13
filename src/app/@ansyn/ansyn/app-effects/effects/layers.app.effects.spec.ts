import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState,
	ILayerState,
	initialCasesState,
	initialLayersState,
	layersFeatureKey,
	LayersReducer,
	layersStateSelector
} from '@ansyn/menu-items';

import { async, inject, TestBed } from '@angular/core/testing';
import { LayersAppEffects } from './layers.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { cloneDeep } from 'lodash';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { IAppState } from '../app.effects.module';
import 'rxjs/add/observable/of';

describe('LayersAppEffects', () => {
	let layersAppEffects: LayersAppEffects;
	let actions: Observable<any>;
	let store: Store<IAppState>;
	const casesState: ICasesState = cloneDeep(initialCasesState);
	const layerState: ILayerState = cloneDeep(initialLayersState);

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({
				[layersFeatureKey]: LayersReducer,
				[casesFeatureKey]: CasesReducer
			})
			],
			providers: [
				provideMockActions(() => actions),
				LayersAppEffects,
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));
	beforeEach(inject([Store], (_store: Store<IAppState>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, casesState],
			[layersStateSelector, layerState]
		]);
		casesState.selectedCase = <any> {
			state: {
				layers: {}
			}
		};
		spyOn(store, 'select').and.callFake((selector) => Observable.of(fakeStore.get(selector)));
	}));

	beforeEach(inject([LayersAppEffects], (_layersAppEffects: LayersAppEffects) => {
		layersAppEffects = _layersAppEffects;
	}));

});
