import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { ContextEntityAppEffects } from './context-entity.app.effect';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Case } from '@ansyn/core/models/case.model';
import { AddMapInstacneAction, BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { MapReducer } from '../../../packages/map-facade/reducers/map.reducer';

describe('ContextEntityAppEffects', () => {
	let contextEntityAppEffects: ContextEntityAppEffects;
	let store: Store<any>;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let imageryCommunicatorServiceMock = {
		provide: () => {
		}
	};
	const imageryComm = {
		getVisualizer: () => {
		}
	};
	const visualizer = {
		setEntities: () => {
		},
		setReferenceDate: () => {
		}
	};

	const feature: GeoJSON.Feature<any> = {
		'type': 'Feature',
		'properties': {},
		'geometry': {
			'type': 'Point',
			'coordinates': [35.71991824722275, 32.709192409794866]
		}
	};

	const fakeContextEntities = [{ id: '1', date: new Date('2015-04-17T03:55:12.129Z'), featureJson: feature }];
	const cases: Case[] = [{
		state: {
			contextEntities: fakeContextEntities,
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
					{ id: 'imagery1', data: { overlay: { date: new Date() } } },
					{ id: 'imagery2', data: { overlay: { date: new Date() } } },
					{ id: 'imagery3', data: { overlay: { date: new Date() } } }
				],
				active_map_id: 'imagery1'
			}
		} as any
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer, map: MapReducer })
			],
			providers: [
				ContextEntityAppEffects,
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				}
			]

		}).compileComponents();
	}));

	/* store data mock */
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selected_case = cases[0];
		const icaseState = { cases, selected_case } as any;
		const iMapState = { mapsList: selected_case.state.maps.data, activeMapId: selected_case.state.maps.active_map_id };
		const fakeStore = { cases: icaseState, map: iMapState };

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore[type]);
		});
	}));

	beforeEach(inject([Store, ContextEntityAppEffects, EffectsRunner, ImageryCommunicatorService], (_store: Store<any>, _ContextEntityAppEffects: ContextEntityAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService) => {
		store = _store;
		contextEntityAppEffects = _ContextEntityAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
		spyOn(imageryCommunicatorService, 'provide').and.returnValue(imageryComm);
		spyOn(imageryComm, 'getVisualizer').and.returnValue(visualizer);
		spyOn(visualizer, 'setEntities');
	}));

	it('should be defined', () => {
		expect(contextEntityAppEffects).toBeTruthy();
	});

	it('displayEntityFromCase$ display context entity from selected case', () => {
		effectsRunner.queue(new SelectCaseByIdAction('fakeCaseId'));

		contextEntityAppEffects.displayEntityFromCase$.subscribe();
		expect(visualizer.setEntities['calls'].count()).toBe(3);
	});

	it('displayEntityFromCase$ DOESN\'T display context entity from selected case if context entity isn\'t provided', () => {
		cases[0].state.contextEntities = null;
		effectsRunner.queue(new SelectCaseByIdAction('fakeCaseId'));

		contextEntityAppEffects.displayEntityFromCase$.subscribe();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityFromNewMap$ should display context entity from selected case on new map', () => {
		cases[0].state.contextEntities = fakeContextEntities;
		const communicators: Array<string> = ['imagery2'];
		effectsRunner.queue(new AddMapInstacneAction({
			currentCommunicatorId: 'imagery2',
			communicatorsIds: communicators
		}));

		contextEntityAppEffects.displayEntityFromNewMap$.subscribe();
		expect(visualizer.setEntities).toHaveBeenCalled();
	});

	it('displayEntityFromNewMap$ should NOT display on new map if doesn\'t exist in case', () => {
		cases[0].state.contextEntities = null;
		const communicators: Array<string> = ['imagery2'];
		effectsRunner.queue(new AddMapInstacneAction({
			currentCommunicatorId: 'imagery2',
			communicatorsIds: communicators
		}));

		contextEntityAppEffects.displayEntityFromNewMap$.subscribe();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromOverlay$ should display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = fakeContextEntities;

		spyOn(visualizer, 'setReferenceDate');
		let fake_overlay = <any>{ id: 'overlayId', isFullOverlay: true };
		effectsRunner.queue(new DisplayOverlayAction({ overlay: fake_overlay, map_id: 'imagery2' }));

		contextEntityAppEffects.displayEntityTimeFromOverlay$.subscribe();
		expect(visualizer.setReferenceDate).toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromOverlay$ should NOT display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = null;
		spyOn(visualizer, 'setReferenceDate');
		let fake_overlay = <any>{ id: 'overlayId', isFullOverlay: true };
		effectsRunner.queue(new DisplayOverlayAction({ overlay: fake_overlay, map_id: 'imagery2' }));

		contextEntityAppEffects.displayEntityTimeFromOverlay$.subscribe();
		expect(visualizer.setReferenceDate).not.toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromBackToWorld$ should display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = fakeContextEntities;

		spyOn(visualizer, 'setReferenceDate');
		effectsRunner.queue(new BackToWorldAction({ mapId: 'imagery2' }));

		contextEntityAppEffects.displayEntityTimeFromBackToWorld$.subscribe();
		expect(visualizer.setReferenceDate).toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromBackToWorld$ should NOT display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = null;

		spyOn(visualizer, 'setReferenceDate');
		effectsRunner.queue(new BackToWorldAction({ mapId: 'imagery2' }));

		contextEntityAppEffects.displayEntityTimeFromBackToWorld$.subscribe();
		expect(visualizer.setReferenceDate).not.toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});
});
