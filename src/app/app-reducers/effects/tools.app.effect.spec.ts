import { ToolsAppEffects } from './tools.app.effect';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { async, TestBed, inject } from '@angular/core/testing';
import { ToolsReducer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	GoToAction,
	PullActiveCenter, SetActiveCenter,
	SetPinLocationModeAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';

describe('ToolsAppEffects', () => {
	let toolsAppEffects: ToolsAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({tools: ToolsReducer, cases: CasesReducer})
			],
			providers: [
				ToolsAppEffects,
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));


	beforeEach(inject([ImageryCommunicatorService ,ToolsAppEffects, EffectsRunner, Store], (_imageryCommunicatorService: ImageryCommunicatorService, _toolsAppEffects: ToolsAppEffects, _effectsRunner: EffectsRunner, _store: Store<any>) => {
		toolsAppEffects = _toolsAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
		imageryCommunicatorService = _imageryCommunicatorService;

		const selectedCase: Case = {id: '1234', state:{maps:{active_map_id: 'active_map_id'}}} as any;
		store.dispatch(new AddCaseSuccessAction(selectedCase));
		store.dispatch(new SelectCaseByIdAction(selectedCase.id));
	}));


	it('getActiveCenter$ should get center from active communicator and return SetCenterAction', () => {
		const activeCommunicator = {
			getCenter: () => {
				return {coordinates: [0,0]};
			}
		};
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		effectsRunner.queue(new PullActiveCenter());
		toolsAppEffects.getActiveCenter$.subscribe((result) => {
			expect(result.constructor).toEqual(SetActiveCenter);
			expect(result.payload).toEqual([0,0])
		})
	});

	it('updatePinLocationAction$ should createMapSingleClickEvent or removeSingleClickEvent on active communicator', () => {
		const activeCommunicator = jasmine.createSpyObj({
			createMapSingleClickEvent: () => {},
			removeSingleClickEvent: () => {}
		});
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		effectsRunner.queue(new SetPinLocationModeAction(true));
		toolsAppEffects.updatePinLocationAction$.subscribe(() => {
			expect(activeCommunicator.createMapSingleClickEvent).toHaveBeenCalled();
		})
	});

	it('onGoTo$ should call SetCenter on active communicator with action.payload', () => {
		const activeCommunicator = jasmine.createSpyObj({
			setCenter: () => {}
		});
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		effectsRunner.queue(new GoToAction([0,0]));
		toolsAppEffects.onGoTo$.subscribe(() => {
			const point = {
				type:'Point',
				coordinates: [0,0]
			};
			expect(activeCommunicator.setCenter).toHaveBeenCalledWith(point);
		})
	});
});
