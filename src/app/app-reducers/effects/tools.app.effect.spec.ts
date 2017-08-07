import { ToolsAppEffects } from './tools.app.effect';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/Observable';
import { cloneDeep } from 'lodash';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { async, TestBed, inject } from '@angular/core/testing';
import { ToolsReducer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import {
	GoToAction,
	PullActiveCenter, SetActiveCenter,
	SetPinLocationModeAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { CasesReducer, ICasesState, AddCaseSuccessAction, SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { ActiveMapChangedAction, BackToWorldAction, ToggleMapAutoImageProcessing } from '@ansyn/map-facade';
import { DisableImageProcessing, EnableImageProcessing, ToggleAutoImageProcessingSuccess } from '@ansyn/menu-items/tools';
import { DisplayOverlayAction, DisplayOverlaySuccessAction } from '@ansyn/overlays';

describe('ToolsAppEffects', () => {
	let toolsAppEffects: ToolsAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let icaseState: ICasesState;


	const cases: Case[] = [{
		state: {
			time: { type: '', from: new Date(), to: new Date() },
			region: {
				type: 'Polygon',
				coordinates: [
					[
						[-64.73, 32.31],
						[-80.19, 25.76],
						[-66.09, 18.43],
						[-64.73, 32.31]
					]
				]
			},
			maps: {
				data: [
					{ id: 'imagery1', data: { position: { zoom: 1, center: 2 }, isAutoImageProcessingActive: true, overlay: 'overlay' } }
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({ tools: ToolsReducer, cases: CasesReducer })
			],
			providers: [
				ToolsAppEffects,
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selected_case = cases[0];
		icaseState = cloneDeep({ cases, selected_case }) as any;
		const fakeStore = { cases: icaseState };

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore[type]);
		});
	}));

	beforeEach(inject([ImageryCommunicatorService, ToolsAppEffects, EffectsRunner], (_imageryCommunicatorService: ImageryCommunicatorService, _toolsAppEffects: ToolsAppEffects, _effectsRunner: EffectsRunner) => {
		toolsAppEffects = _toolsAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));


	it('getActiveCenter$ should get center from active communicator and return SetCenterAction', () => {
		const activeCommunicator = {
			getCenter: () => {
				return { coordinates: [0, 0] };
			}
		};
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		effectsRunner.queue(new PullActiveCenter());
		let result = null;
		toolsAppEffects.getActiveCenter$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(SetActiveCenter);
		expect(result.payload).toEqual([0, 0])
	});

	describe('updatePinLocationAction$ should createMapSingleClickEvent or removeSingleClickEvent on ', () => {
		const activeCommunicator = {
			createMapSingleClickEvent: () => { },
			removeSingleClickEvent: () => { }
		};

		beforeEach(() => {
			spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [activeCommunicator, activeCommunicator]);
		});

		it('should call createMapSingleClickEvent per communicator ( action.payload equal "true") ', () => {
			spyOn(activeCommunicator, 'createMapSingleClickEvent');
			effectsRunner.queue(new SetPinLocationModeAction(true));
			toolsAppEffects.updatePinLocationAction$.subscribe();
			expect(activeCommunicator.createMapSingleClickEvent).toHaveBeenCalledTimes(2);
		});

		it('should call removeSingleClickEvent per communicator ( action.payload equal "false") ', () => {
			spyOn(activeCommunicator, 'removeSingleClickEvent');
			effectsRunner.queue(new SetPinLocationModeAction(false));
			toolsAppEffects.updatePinLocationAction$.subscribe();
			expect(activeCommunicator.removeSingleClickEvent).toHaveBeenCalled();
		});

	});

	it('onGoTo$ should call SetCenter on active communicator with action.payload', () => {
		const activeCommunicator = jasmine.createSpyObj({
			setCenter: () => { }
		});
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		effectsRunner.queue(new GoToAction([0, 0]));
		toolsAppEffects.onGoTo$.subscribe();
		const point = {
			type: 'Point',
			coordinates: [0, 0]
		};
		expect(activeCommunicator.setCenter).toHaveBeenCalledWith(point);
	});

	it('should be defined', () => {
		expect(toolsAppEffects).toBeTruthy();
	});

	describe('onActiveMapChanges', () => {
		it('onActiveMapChanges with overlay null should raise DisableImageProcessing', () => {
			const mapId = icaseState.selected_case.state.maps.active_map_id;
			const active_map = icaseState.selected_case.state.maps.data.find((map) => map.id === mapId);
			active_map.data.overlay = null;

			effectsRunner.queue(new ActiveMapChangedAction());

			toolsAppEffects.onActiveMapChanges$.subscribe(_result => {
				expect(_result instanceof DisableImageProcessing).toBeTruthy();
			});
		});

		it('onActiveMapChanges with overlay and image processing as true on should raise EnableImageProcessing and ToggleImageProcessingSuccess with true', () => {
			effectsRunner.queue(new ActiveMapChangedAction());

			toolsAppEffects.onActiveMapChanges$.subscribe(_result => {
				const result = _result instanceof EnableImageProcessing || _result instanceof ToggleAutoImageProcessingSuccess;
				expect(result).toBe(true);

				if (_result instanceof ToggleAutoImageProcessingSuccess) {
					expect(_result.payload).toBeTruthy();
				}
			});
		});

		it('onActiveMapChanges with overlay and image processing as false on should raise EnableImageProcessing and ToggleImageProcessingSuccess with false', () => {
			const mapId = icaseState.selected_case.state.maps.active_map_id;
			const active_map = icaseState.selected_case.state.maps.data.find((map) => map.id === mapId);
			active_map.data.isAutoImageProcessingActive = false;

			effectsRunner.queue(new ActiveMapChangedAction());

			toolsAppEffects.onActiveMapChanges$.subscribe(_result => {
				const result = _result instanceof EnableImageProcessing || _result instanceof ToggleAutoImageProcessingSuccess;
				expect(result).toBe(true);

				if (_result instanceof ToggleAutoImageProcessingSuccess) {
					expect(_result.payload).toBeFalsy();
				}
			});
		});
	});

	describe('onDisplayOverlay', () => {
		it('onDisplayOverlay should raise EnableImageProcessing', () => {
			effectsRunner.queue(new DisplayOverlayAction({ overlay: <any>'overlay' }));

			toolsAppEffects.onDisplayOverlay$.subscribe(_result => {
				expect(_result instanceof EnableImageProcessing).toBeTruthy();
			});
		});
	});

	describe('onDisplayOverlaySuccess', () => {
		it('onDisplayOverlaySuccess with image processing as true should raise ToggleMapAutoImageProcessing and ToggleAutoImageProcessingSuccess accordingly', () => {
			effectsRunner.queue(new DisplayOverlaySuccessAction({ id: 'id' }));

			toolsAppEffects.onActiveMapChanges$.subscribe(_result => {
				const result = _result instanceof ToggleMapAutoImageProcessing || _result instanceof ToggleAutoImageProcessingSuccess;
				expect(result).toBe(true);

				if (_result instanceof ToggleAutoImageProcessingSuccess) {
					expect(_result.payload).toBeTruthy();
				}

				if (_result instanceof ToggleMapAutoImageProcessing) {
					const toggleMapResult: ToggleMapAutoImageProcessing = _result;
					expect(toggleMapResult.payload.mapId).toBe('imagery1');
					expect(toggleMapResult.payload.toggle_value).toBeTruthy();
				}
			});
		});

		it('onDisplayOverlaySuccess with image processing as false should raise ToggleMapAutoImageProcessing and ToggleAutoImageProcessingSuccess accordingly', () => {
			const mapId = icaseState.selected_case.state.maps.active_map_id;
			const active_map = icaseState.selected_case.state.maps.data.find((map) => map.id === mapId);
			active_map.data.isAutoImageProcessingActive = false;

			effectsRunner.queue(new DisplayOverlaySuccessAction({ id: 'id' }));

			toolsAppEffects.onActiveMapChanges$.subscribe(_result => {
				const result = _result instanceof ToggleMapAutoImageProcessing || _result instanceof ToggleAutoImageProcessingSuccess;
				expect(result).toBe(true);

				if (_result instanceof ToggleAutoImageProcessingSuccess) {
					expect(_result.payload).toBeFalsy();
				}

				if (_result instanceof ToggleMapAutoImageProcessing) {
					const toggleMapResult: ToggleMapAutoImageProcessing = _result;
					expect(toggleMapResult.payload.mapId).toBe('imagery1');
					expect(toggleMapResult.payload.toggle_value).toBeFalsy();
				}
			});
		});
	});

	describe('backToWorldView', () => {
		it('backToWorldView should raise DisableImageProcessing', () => {
			effectsRunner.queue(new BackToWorldAction());

			toolsAppEffects.backToWorldView$.subscribe(_result => {
				expect(_result instanceof DisableImageProcessing).toBeTruthy();
			});
		});
	});

	describe('onSelectCaseById', () => {
		it('onSelectCaseById should raise DisableImageProcessing', () => {
			effectsRunner.queue(new SelectCaseByIdAction('asdfasd'));

			toolsAppEffects.onSelectCaseById$.subscribe(_result => {
				expect(_result instanceof DisableImageProcessing).toBeTruthy();
			});
		});
	});

	describe('toggleAutoImageProcessing', () => {
		it('toggleAutoImageProcessing with image processing as true should raise ToggleMapAutoImageProcessing, UpdateCaseAction and ToggleAutoImageProcessingSuccess accordingly', () => {
			effectsRunner.queue(new SelectCaseByIdAction('asdfasd'));

			toolsAppEffects.toggleAutoImageProcessing$.subscribe(_result => {
				const result = _result instanceof ToggleMapAutoImageProcessing || _result instanceof UpdateCaseAction
					|| _result instanceof UpdateCaseAction;
				expect(result).toBe(true);

				if (_result instanceof ToggleMapAutoImageProcessing) {
					const toggleMapResult: ToggleMapAutoImageProcessing = _result;
					expect(toggleMapResult.payload.mapId).toBe('imagery1');
					expect(toggleMapResult.payload.toggle_value).toBeTruthy();
				}

				if (_result instanceof UpdateCaseAction) {
					const updateCaseAction: UpdateCaseAction = _result;
					const updatedCase: Case = updateCaseAction.payload;
					const mapId = updatedCase.state.maps.active_map_id;
					const active_map = updatedCase.state.maps.data.find((map) => map.id === mapId);

					expect(active_map.data.isAutoImageProcessingActive).toBeTruthy();
				}

				if (_result instanceof ToggleAutoImageProcessingSuccess) {
					expect(_result.payload).toBeTruthy();
				}
			});
		});
	});
});
