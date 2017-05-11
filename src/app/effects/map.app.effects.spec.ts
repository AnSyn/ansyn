import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { CasesReducer } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { ImageryCommunicatorService } from '../packages/imagery/api/imageryCommunicator.service';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '../packages/menu-items/cases/reducers/cases.reducer';
import { SelectCaseAction } from '../packages/menu-items/cases/actions/cases.actions';

describe('MapAppEffects', () => {
	let mapAppEffects: MapAppEffects;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	let icase_state: ICasesState;
	let imageryCommunicatorServiceMock = {
		provideCommunicator() {}
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({cases: CasesReducer})],
			providers: [
				MapAppEffects,
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				}
			]

		}).compileComponents();
	}));


	beforeEach(inject([Store], (_store: Store <any>) => {
		store = _store;

		icase_state = {
			cases: [
				{
					id: 'case1',
					state: {
						maps: [{
								position: {
							 		center: "",
									zoom: 1
								}
							}]
					}
				}
			],
			selected_case_id: null
		} as any;

		spyOn(store, 'select').and.callFake(() => {
			return Observable.of(icase_state);
		});
	}));

	beforeEach(inject([MapAppEffects, EffectsRunner, ImageryCommunicatorService], (_mapAppEffects: MapAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService) => {
		mapAppEffects = _mapAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(mapAppEffects).toBeTruthy();
	});


	it('selectCase$ should get selected_case and set the position from case on the map', () => {
		let selected_case = icase_state.cases[0];
		let action: SelectCaseAction = new SelectCaseAction('case1');
		let imagery1 = {
			setPosition: () => {

			}
		};
		effectsRunner.queue(action);
		spyOn(imageryCommunicatorService, 'provideCommunicator').and.callFake(() => imagery1);
		spyOn(imagery1, 'setPosition');

		mapAppEffects.selectCase$.subscribe(() => {
			expect(imagery1.setPosition).toHaveBeenCalledWith(selected_case.state.maps[0].position);
		});
	})

});
