import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreAppEffects } from './core.app.effects';
import { coreInitialState, coreStateSelector, GoNextPresetOverlay, IOverlay, LoggerService } from '../../modules/core/public_api';
import { cold, hot } from 'jasmine-marbles';
import { casesStateSelector, initialCasesState } from '../../modules/menu-items/public_api';
import { initialMapState, mapStateSelector } from '@ansyn/map-facade';
import { DisplayOverlayAction } from '../../modules/overlays/public_api';

function mockOverlay(id: string): IOverlay {
	const overlay = <IOverlay> {};
	overlay.id = id;
	return overlay;
}

describe('CoreAppEffects', () => {
	let coreAppEffects: CoreAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let overlays1to3: Array<IOverlay>;
	let overlays1to4: Array<IOverlay>;
	const coreState = { ...coreInitialState };
	const casesState = { ...initialCasesState };
	const mapsState = { ...initialMapState };

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				CoreAppEffects,
				provideMockActions(() => actions),
				{
					provide: LoggerService,
					useValue: () => null
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[coreStateSelector, coreState],
			[casesStateSelector, casesState],
			[mapStateSelector, mapsState]
		]);
		spyOn(store, 'select').and.callFake((selector) => of(fakeStore.get(selector)));
	}));

	beforeEach(inject([CoreAppEffects], (_coreAppEffects: CoreAppEffects) => {
		coreAppEffects = _coreAppEffects;
		overlays1to3 = [mockOverlay('1'), mockOverlay('2'), mockOverlay('3')];
		overlays1to4 = [overlays1to3[0], overlays1to3[1], overlays1to3[2], mockOverlay('4')];
	}));

	it('should be defined', () => {
		expect(coreAppEffects).toBeDefined();
	});


	describe('onNextPresetOverlay$ should return an action which displays the next preset overlay', () => {
		beforeEach(() => {
			mapsState.activeMapId = 'map_1';
			mapsState.entities = {
				'map_1': {
					id: 'map_1', data: {
						position: null
					}, worldView: { mapType: null, sourceType: null }, flags: null
				}
			};
			coreState.presetOverlays = overlays1to3;
		});
		it('if no preset overlay currently displays, should display presetOverlays[0]', () => {
			actions = hot('--a--', { a: new GoNextPresetOverlay() });

			const expectedResult = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: coreState.presetOverlays[0], mapId: 'map_1' })
			});

			expect(coreAppEffects.onNextPresetOverlay$).toBeObservable(expectedResult);
		});
		it('if presetOverlays[n] overlay currently displays, should display presetOverlays[n+1]', () => {
			mapsState.entities['map_1'].data.overlay = coreState.presetOverlays[0];
			actions = hot('--a--', { a: new GoNextPresetOverlay() });

			const expectedResult = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: coreState.presetOverlays[1], mapId: 'map_1' })
			});

			expect(coreAppEffects.onNextPresetOverlay$).toBeObservable(expectedResult);
		});
		it('if presetOverlays[last] overlay currently displays, should display presetOverlays[0]', () => {
			mapsState.entities['map_1'].data.overlay = coreState.presetOverlays[2];
			actions = hot('--a--', { a: new GoNextPresetOverlay() });

			const expectedResult = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: coreState.presetOverlays[0], mapId: 'map_1' })
			});

			expect(coreAppEffects.onNextPresetOverlay$).toBeObservable(expectedResult);
		});
	});

})
;
