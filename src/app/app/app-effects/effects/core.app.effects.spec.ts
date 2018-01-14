import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreAppEffects } from './core.app.effects';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { cold, hot } from 'jasmine-marbles';
import { SetFavoriteOverlaysAction, ToggleFavoriteAction } from '@ansyn/core/actions/core.actions';
import { casesStateSelector, initialCasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { initialMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { CoreService } from '@ansyn/core/services/core.service';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import { Case } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';

function mockOverlay(id: string): Overlay {
	const overlay = new Overlay();
	overlay.id = id;
	return overlay;
}
describe('CoreAppEffects', () => {
	let coreAppEffects: CoreAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let overlays1to3: Array<Overlay>;
	let overlays1to4: Array<Overlay>;
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
				provideMockActions(() => actions)
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

	it('setFavoritesOverlaysUpdateCase$ should update selected case and overlay markup', () => {
		casesState.selectedCase = <Case> { state: { favoritesOverlays: overlays1to3 } };
		const markupsResult = {};
		spyOn(CoreService, 'getOverlaysMarkup').and.callFake(() => markupsResult);
		actions = hot('--a--', { a: new SetFavoriteOverlaysAction(overlays1to4) });

		const expectedResult = cold('--(ab)--', {
			a: new OverlaysMarkupAction(markupsResult),
			b: new UpdateCaseAction(<Case> { ...casesState.selectedCase, state: { ...casesState.selectedCase.state, favoritesOverlays: overlays1to4 } })
		});

		expect(coreAppEffects.setFavoritesOverlaysUpdateCase$).toBeObservable(expectedResult);
		expect(CoreService.getOverlaysMarkup).toHaveBeenCalled();
	});
});
