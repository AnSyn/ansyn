import { ContainerChangedTriggerAction, MenuConfig, menuFeatureKey, MenuReducer } from '@ansyn/menu';
import { casesFeatureKey, CasesReducer } from '../../modules/menu-items/cases/reducers/cases.reducer';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { UpdateMapSizeAction, ToggleFooter } from '@ansyn/map-facade';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { RedrawTimelineAction } from '../../modules/overlays/actions/overlays.actions';
import { ResetAppAction, ToggleIsPinnedAction, UnSelectMenuItemAction } from '../../../menu/actions/menu.actions';
import { LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { COMPONENT_MODE } from '../../app-providers/component-mode';
import { ShowOverlaysFootprintAction, StartMouseShadow, AnnotationSetProperties } from '../../modules/menu-items/tools/actions/tools.actions';
import { getInitialAnnotationsFeatureStyle } from '@ansyn/imagery';

describe('MenuAppEffects', () => {
	let menuAppEffects: MenuAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [menuFeatureKey]: MenuReducer, [casesFeatureKey]: CasesReducer })],
			providers: [
				provideMockActions(() => actions),
				MenuAppEffects,
				{ provide: MenuConfig, useValue: {} }, {
					provide: COMPONENT_MODE,
					useValue: false
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

	it(`onResetApp$ should call LoadDefaultCaseAction`, () => {
		actions = hot('--a--', {
			a: new ResetAppAction()
		});
		const expectedResults = cold('--(bcdefgh)--', {
			b: new LoadDefaultCaseAction(),
			c: new ShowOverlaysFootprintAction('None'),
			d: new StartMouseShadow({fromUser: true}),
			e: new AnnotationSetProperties(getInitialAnnotationsFeatureStyle()),
			f: new ToggleIsPinnedAction(false),
			g: new UnSelectMenuItemAction(),
			h: new ToggleFooter(false)
		});
		expect(menuAppEffects.onResetApp$).toBeObservable(expectedResults);
	});

});
