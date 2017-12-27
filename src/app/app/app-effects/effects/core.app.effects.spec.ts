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

describe('CoreAppEffects', () => {
	let coreAppEffects: CoreAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
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
	}));

	it('should be defined', () => {
		expect(coreAppEffects).toBeDefined();
	});

	describe('onFavorite$ should toggle favorite id and update favoriteOverlays value', () => {
		it('not exist id ', () => {
			coreState.favoriteOverlays = ['1', '2', '3'];
			actions = hot('--a--', { a: new ToggleFavoriteAction('4') });
			const expectedResult = cold('--b--', { b: new SetFavoriteOverlaysAction([...coreState.favoriteOverlays, '4']) });
			expect(coreAppEffects.onFavorite$).toBeObservable(expectedResult);
		});

		it('exist id ', () => {
			coreState.favoriteOverlays = ['1', '2', '3', '4'];
			actions = hot('--a--', { a: new ToggleFavoriteAction('4') });
			const expectedResult = cold('--b--', { b: new SetFavoriteOverlaysAction(['1', '2', '3']) });
			expect(coreAppEffects.onFavorite$).toBeObservable(expectedResult);
		});
	});

	it('setFavoritesOverlaysUpdateCase$ should update selected case and overlay markup', () => {
		casesState.selectedCase = <Case> { state: { favoritesOverlays: ['1', '2', '3'] } };
		const markupsResult = {};
		spyOn(CoreService, 'getOverlaysMarkup').and.callFake(() => markupsResult);
		actions = hot('--a--', { a: new SetFavoriteOverlaysAction(['1', '2', '3', '4']) });

		const expectedResult = cold('--(ab)--', {
			a: new OverlaysMarkupAction(markupsResult),
			b: new UpdateCaseAction(<Case> { ...casesState.selectedCase, state: { ...casesState.selectedCase.state, favoritesOverlays: ['1', '2', '3', '4'] } })
		});

		expect(coreAppEffects.setFavoritesOverlaysUpdateCase$).toBeObservable(expectedResult);
		expect(CoreService.getOverlaysMarkup).toHaveBeenCalled();
	});
});
