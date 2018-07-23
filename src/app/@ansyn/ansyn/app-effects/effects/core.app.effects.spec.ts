import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreAppEffects } from './core.app.effects';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { cold, hot } from 'jasmine-marbles';
import {
	GoNextPresetOverlay,
	SetFavoriteOverlaysAction,
	SetPresetOverlaysAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '@ansyn/core/actions/core.actions';
import { casesStateSelector, initialCasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { initialMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ICase } from '@ansyn/core/models/case.model';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { DisplayOverlayAction, SetMarkUp } from '@ansyn/overlays/actions/overlays.actions';
import { MarkUpClass } from '@ansyn/overlays/reducers/overlays.reducer';

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

	describe('onFavorite$ should toggle favorite id and update favoriteOverlays value', () => {
		it('not exist in favorites ', () => {
			const favorite = overlays1to4[3];
			coreState.favoriteOverlays = overlays1to3;
			actions = hot('--a--', { a: new ToggleFavoriteAction(favorite) });
			const expectedResult = cold('--b--', { b: new SetFavoriteOverlaysAction(overlays1to4) });
			expect(coreAppEffects.onFavorite$).toBeObservable(expectedResult);
		});

		it('exist in favorites ', () => {
			const favorite = overlays1to4[3];
			coreState.favoriteOverlays = overlays1to4;
			actions = hot('--a--', { a: new ToggleFavoriteAction(favorite) });
			const expectedResult = cold('--b--', { b: new SetFavoriteOverlaysAction(overlays1to3) });
			expect(coreAppEffects.onFavorite$).toBeObservable(expectedResult);
		});
	});

	describe('onPreset$ should toggle preset id and update presetOverlays value', () => {
		it('not exist in presets ', () => {
			const preset = overlays1to4[3];
			coreState.presetOverlays = overlays1to3;
			actions = hot('--a--', { a: new TogglePresetOverlayAction(preset) });
			const expectedResult = cold('--b--', { b: new SetPresetOverlaysAction(overlays1to4) });
			expect(coreAppEffects.onPreset$).toBeObservable(expectedResult);
		});

		it('exist in presets ', () => {
			const preset = overlays1to4[3];
			coreState.presetOverlays = overlays1to4;
			actions = hot('--a--', { a: new TogglePresetOverlayAction(preset) });
			const expectedResult = cold('--b--', { b: new SetPresetOverlaysAction(overlays1to3) });
			expect(coreAppEffects.onPreset$).toBeObservable(expectedResult);
		});
	});

	it('setFavoriteOverlaysUpdateCase$ should update selected case and overlay markup', () => {
		casesState.selectedCase = <ICase> { state: { favoriteOverlays: overlays1to3 } };
		const markupsResult = {
			classToSet: MarkUpClass.favorites,
			dataToSet: {
				overlaysIds: overlays1to3.map(overlay => overlay.id)
			}
		};
		actions = hot('--a--', { a: new SetFavoriteOverlaysAction(overlays1to3) });

		const expectedResult = cold('--b--', {
			b: new SetMarkUp(markupsResult)
		});

		expect(coreAppEffects.setFavoriteOverlaysUpdateCase$).toBeObservable(expectedResult);
	});


	it('setPresetOverlaysUpdateCase$ should update selected case and overlay markup', () => {
		casesState.selectedCase = <ICase> { state: { presetOverlays: overlays1to3 } };
		const markupsResult = {
			classToSet: MarkUpClass.presets,
			dataToSet: {
				overlaysIds: overlays1to3.map(overlay => overlay.id)
			}
		};
		actions = hot('--a--', { a: new SetPresetOverlaysAction(overlays1to3) });

		const expectedResult = cold('--b--', {
			b: new SetMarkUp(markupsResult)
		});

		expect(coreAppEffects.setPresetOverlaysUpdateCase$).toBeObservable(expectedResult);
	});

	describe('onNextPresetOverlay$ should return an action which displays the next preset overlay', () => {
		beforeEach(() => {
			mapsState.activeMapId = 'map_1';
			mapsState.mapsList = [{
				id: 'map_1', data: {
					position: null
				}, mapType: null, sourceType: null, flags: null
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

});
