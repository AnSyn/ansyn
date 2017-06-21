import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { ChangeLayoutAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import {
	AddCaseSuccessAction, SelectCaseByIdAction, UpdateCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { ImageryCommunicatorService } from '../../packages/imagery/communicator-service/communicator.service';
import { OverlaysConfig, OverlaysService } from '../../packages/overlays/services/overlays.service';
import { ConnectionBackend, Http, HttpModule, RequestOptions } from '@angular/http';
import { configuration } from "configuration/configuration";

describe('StatusBarAppEffects', () => {
	let statusBarAppEffects: StatusBarAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer})
			],
			providers: [
					StatusBarAppEffects,
					{provide: CasesService, useValue: {updateCase: () => null}},
					ImageryCommunicatorService,
					OverlaysService,
					Http,
					ConnectionBackend,
					{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig }
				]
		}).compileComponents();
	}));


	beforeEach(inject([StatusBarAppEffects, EffectsRunner, Store, CasesService], (_statusBarAppEffects: StatusBarAppEffects, _effectsRunner: EffectsRunner, _store: Store<any>, _casesService: CasesService) => {
		statusBarAppEffects = _statusBarAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
		casesService = _casesService;
	}));

	it('onLayoutsChange$ should; set new layout_index on selected_case, change the maps of selected_case if layouts map_count are not equal', () => {
		spyOn(casesService, 'updateCase').and.callFake((s_case) => Observable.of(s_case));
		spyOn(statusBarAppEffects, 'setMapsDataChanges').and.callFake((s_case) => s_case);

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

		statusBarAppEffects.onLayoutsChange$.subscribe((_result: UpdateCaseAction | UpdateMapSizeAction)=>{
			expect((_result instanceof UpdateCaseAction) || (_result instanceof UpdateMapSizeAction) ).toBeTruthy();

			if ( _result instanceof UpdateCaseAction) {
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
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));
		statusBarAppEffects.selectCase$.subscribe((result: ChangeLayoutAction)=>{
			expect(result instanceof ChangeLayoutAction).toBeTruthy();
			expect(result.payload).toEqual(layouts_index);
		});
	});

});
