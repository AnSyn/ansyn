import {
	ContainerChangedTriggerAction, MenuConfig,
	menuFeatureKey,
	MenuReducer
	, ResetAppAction, ToggleIsPinnedAction, UnSelectMenuItemAction
} from '@ansyn/menu';
import { casesFeatureKey, CasesReducer } from '../../modules/menu-items/cases/reducers/cases.reducer';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { ToggleFooter, UpdateMapSizeAction } from '@ansyn/map-facade';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { LoadOverlaysSuccessAction, RedrawTimelineAction } from '../../modules/overlays/actions/overlays.actions';
import { CloseModalAction, LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { COMPONENT_MODE } from '../../app-providers/component-mode';
import { InitializeFiltersAction } from '../../modules/filters/actions/filters.actions';
import { MatDialog } from '@angular/material/dialog';
import { SetLayersModal } from '../../modules/menu-items/layers-manager/actions/layers.actions';
import { SelectedModalEnum } from '../../modules/menu-items/layers-manager/reducers/layers-modal';

describe('MenuAppEffects', () => {
	let menuAppEffects: MenuAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [menuFeatureKey]: MenuReducer, [casesFeatureKey]: CasesReducer })],
			providers: [
				provideMockActions(() => actions),
				MenuAppEffects,
				{ provide: MenuConfig, useValue: {} }, {
					provide: COMPONENT_MODE,
					useValue: false
				},
				{
					provide: MatDialog,
					useValue: {
						closeAll: () => {}
					}
				}
			]

		}).compileComponents();
	}));


	beforeEach(inject([MenuAppEffects], (_menuAppEffects: MenuAppEffects) => {
		menuAppEffects = _menuAppEffects;
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('onContainerChanged$ effect should dispatch UpdateMapSizeAction and RedrawTimelineAction', () => {
		actions = hot('--a--', { a: new ContainerChangedTriggerAction() });
		const expectedResults = cold('--(ab)--', { a: new UpdateMapSizeAction(), b: new RedrawTimelineAction() });
		expect(menuAppEffects.onContainerChanged$).toBeObservable(expectedResults);
	});

	it(`onResetApp$ should dispatch specified actions`, () => {
		actions = hot('--a--', {
			a: new ResetAppAction()
		});
		const expectedResults = cold('--(bcdefghi)--', {
			b: new ToggleIsPinnedAction(false),
			c: new CloseModalAction(),
			d: new SetLayersModal({ type: SelectedModalEnum.none, layer: null }),
			e: new UnSelectMenuItemAction(),
			f: new ToggleFooter(false),
			g: new LoadOverlaysSuccessAction([], true),
			h: new InitializeFiltersAction(),
			i: new LoadDefaultCaseAction()
		});
		expect(menuAppEffects.onResetApp$).toBeObservable(expectedResults);
	});
});
