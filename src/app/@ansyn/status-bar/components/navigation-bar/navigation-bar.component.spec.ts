import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { NavigationBarComponent } from './navigation-bar.component';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';
import { statusBarFeatureKey, StatusBarReducer } from '../../reducers/status-bar.reducer';
import { GoAdjacentOverlay } from '../../../core/actions/core.actions';
import { ExpandAction } from '../../actions/status-bar.actions';

describe('NavigationBarComponent', () => {
	let component: NavigationBarComponent;
	let fixture: ComponentFixture<NavigationBarComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [NavigationBarComponent],
			imports: [StoreModule.forRoot({ [statusBarFeatureKey]: StatusBarReducer })],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				},
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any> ) => {
		fixture = TestBed.createComponent(NavigationBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('clicks', () => {
		it('clickGoPrev should dispatch action GoPrevAction', () => {
			spyOn(store, 'dispatch');
			component.clickGoAdjacent(false);
			expect(store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: false }));
		});
		it('clickGoNext should dispatch action GoNextAction', () => {
			spyOn(store, 'dispatch');
			component.clickGoAdjacent(true);
			expect(store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: true }));
		});
		it('clickExpand should dispatch action ExpandAction', () => {
			spyOn(store, 'dispatch');
			component.clickExpand();
			expect(store.dispatch).toHaveBeenCalledWith(new ExpandAction());
		});
	});

	[{ k: 39, n: 'goNextActive', f: 'clickGoAdjacent' }, {
		k: 37,
		n: 'goPrevActive',
		f: 'clickGoAdjacent'
	}].forEach(key => {
		it(`onkeyup should call ${key.n} when keycode = "${key.k}"`, () => {
			spyOn(component, <'clickGoAdjacent'>key.f);
			expect(component[key.n]).toEqual(false);
			const $event = {
				which: key.k,
				currentTarget: { document: { activeElement: {} } }
			};
			component.onkeydown(<any>$event);
			expect(component[key.n]).toEqual(true);

			component.onkeyup(<any>$event);
			expect(component[key.n]).toEqual(false);
			expect(component[key.f]).toHaveBeenCalled();
		});
	});
});
