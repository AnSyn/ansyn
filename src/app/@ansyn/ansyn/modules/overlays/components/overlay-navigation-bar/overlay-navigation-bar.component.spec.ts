import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayNavigationBarComponent } from './overlay-navigation-bar.component';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';
import {
	IStatusBarState,
	selectComboBoxesProperties,
	statusBarFeatureKey,
	StatusBarReducer
} from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction, GoAdjacentOverlay } from '../../../status-bar/actions/status-bar.actions';
import { TranslateModule } from '@ngx-translate/core';
import {
	mapFeatureKey,
	MapReducer,
	selectActiveMapId,
	selectLayout,
	selectMapsList,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import {
	overlayStatusFeatureKey, OverlayStatusReducer,
	selectPresetOverlays
} from '../../overlay-status/reducers/overlay-status.reducer';
import { of } from 'rxjs';

describe('OverlyaNavigationBarComponent', () => {
	let component: OverlayNavigationBarComponent;
	let fixture: ComponentFixture<OverlayNavigationBarComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayNavigationBarComponent],
			imports: [StoreModule.forRoot({
				[mapFeatureKey]: MapReducer,
				[statusBarFeatureKey]: StatusBarReducer,
				[overlayStatusFeatureKey]: OverlayStatusReducer
			}), TranslateModule.forRoot()],
			providers: [
				{
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayNavigationBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectMapsList, [{id: 'activeMap'}]],
			[ selectActiveMapId, 'activeMap'],
			[selectOverlayOfActiveMap, undefined],
			[selectPresetOverlays, []]
		]);

		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));
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

	[{ k: 'ArrowRight', n: 'goNextActive', f: 'clickGoAdjacent' }, {
		k: 'ArrowLeft',
		n: 'goPrevActive',
		f: 'clickGoAdjacent'
	}].forEach(key => {
		it(`onkeyup should call ${ key.n } when key = "${ key.k }"`, () => {
			spyOn(component, <'clickGoAdjacent'>key.f);
			expect(component[key.n]).toEqual(false);
			const $event = {
				key: key.k,
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
