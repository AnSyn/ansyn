import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreAppEffects } from './core.app.effects';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { cold, hot } from 'jasmine-marbles';
import { GoNextPresetOverlay } from '@ansyn/core/actions/core.actions';
import { casesStateSelector, initialCasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { initialMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { DisplayOverlayAction } from '@ansyn/core/overlays/actions/overlays.actions';

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
		spyOn(store, 'select').and.callFake((selector) => Observable.of(fakeStore.get(selector)));
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
			mapsState.mapsList = [{
				id: 'map_1', data: {
					position: null
				}, worldView: { mapType: null, sourceType: null }, flags: null
			}];
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
			mapsState.mapsList[0].data.overlay = coreState.presetOverlays[0];
			actions = hot('--a--', { a: new GoNextPresetOverlay() });

			const expectedResult = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: coreState.presetOverlays[1], mapId: 'map_1' })
			});

			expect(coreAppEffects.onNextPresetOverlay$).toBeObservable(expectedResult);
		});
		it('if presetOverlays[last] overlay currently displays, should display presetOverlays[0]', () => {
			mapsState.mapsList[0].data.overlay = coreState.presetOverlays[2];
			actions = hot('--a--', { a: new GoNextPresetOverlay() });

			const expectedResult = cold('--b--', {
				b: new DisplayOverlayAction({ overlay: coreState.presetOverlays[0], mapId: 'map_1' })
			});

			expect(coreAppEffects.onNextPresetOverlay$).toBeObservable(expectedResult);
		});
	});

})
;
