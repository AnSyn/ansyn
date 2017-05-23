import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { ChangeLayoutAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import {
	AddCaseSuccessAction, SelectCaseAction,
	UpdateCaseSuccessAction
} from '../../packages/menu-items/cases/actions/cases.actions';
import { CasesReducer } from '../../packages/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { UpdateMapSizeAction } from '../../packages/map-facade/actions/map.actions';

describe('StatusBarAppEffects', () => {
	let statusBarAppEffects: StatusBarAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer})],
			providers: [StatusBarAppEffects, {provide: CasesService, useValue: {updateCase: () => null}}]
		}).compileComponents();
	}));


	beforeEach(inject([StatusBarAppEffects, EffectsRunner, Store, CasesService], (_statusBarAppEffects: StatusBarAppEffects, _effectsRunner: EffectsRunner, _store: Store<any>, _casesService: CasesService) => {
		statusBarAppEffects = _statusBarAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
		casesService = _casesService;
	}));

	it('onLayoutsChange should; set new layout_index on selected_case, change the maps of selected_case if layouts map_count are not equal', () => {
		const new_layout_index = 1;
		const layouts_index = 2;

		const caseItem: Case = <any> {
			id: "31b33526-6447-495f-8b52-83be3f6b55bd",
			state:{
				maps:{
					layouts_index
				}
			}
		};
		store.dispatch(new AddCaseSuccessAction(caseItem));

		let action: ChangeLayoutAction = new ChangeLayoutAction(new_layout_index);
		effectsRunner.queue(action);
		let result: number;

		spyOn(casesService, 'updateCase').and.callFake((s_case) => Observable.of(s_case));

		statusBarAppEffects.onLayoutsChange$.subscribe((_result: UpdateCaseSuccessAction | UpdateMapSizeAction)=>{
			expect((_result instanceof UpdateCaseSuccessAction) || (_result instanceof UpdateMapSizeAction) ).toBeTruthy();

			if ( _result instanceof UpdateCaseSuccessAction) {
				expect(_result.payload.state.maps.layouts_index).toEqual(new_layout_index);
			}
		});
	});

	it('selectCase$ should get layers_index from selected_case and return ChangeLayoutAction with result', () => {
		const layouts_index = 2;
		const caseItem: Case = <any> {
			id: "31b33526-6447-495f-8b52-83be3f6b55bd",
			state:{
				maps:{
					layouts_index
				}
			}
		};

		store.dispatch(new AddCaseSuccessAction(caseItem));
		effectsRunner.queue(new SelectCaseAction({id: caseItem.id, index: 0}));
		statusBarAppEffects.selectCase$.subscribe((result: ChangeLayoutAction)=>{
			expect(result instanceof ChangeLayoutAction).toBeTruthy();
			expect(result.payload).toEqual(layouts_index)
		});
	})



});
