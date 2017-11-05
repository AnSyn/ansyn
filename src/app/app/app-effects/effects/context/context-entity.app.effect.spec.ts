import { async, inject, TestBed } from '@angular/core/testing';

import { ContextEntityAppEffects } from './context-entity.app.effect';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Case } from '@ansyn/core/models/case.model';
import { AddMapInstanceAction, BackToWorldAction } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { mapFeatureKey, MapReducer, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';

describe('ContextEntityAppEffects', () => {
	let contextEntityAppEffects: ContextEntityAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
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
				activeMapId: 'imagery1'
			}
		} as any
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [

				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer, [mapFeatureKey]: MapReducer })
			],
			providers: [
				provideMockActions(() => actions),
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
		const selectedCase = cases[0];
		const icaseState = { cases, selectedCase } as any;
		const iMapState = {
			mapsList: selectedCase.state.maps.data,
			activeMapId: selectedCase.state.maps.activeMapId
		};
		const fakeStore = new Map<any, any>([
			[casesStateSelector, icaseState],
			[mapStateSelector, iMapState]
		]);
		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([Store, ContextEntityAppEffects, ImageryCommunicatorService], (_store: Store<any>, _ContextEntityAppEffects: ContextEntityAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		store = _store;
		contextEntityAppEffects = _ContextEntityAppEffects;

		imageryCommunicatorService = _imageryCommunicatorService;
		spyOn(imageryCommunicatorService, 'provide').and.returnValue(imageryComm);
		spyOn(imageryComm, 'getVisualizer').and.returnValue(visualizer);
		spyOn(visualizer, 'setEntities');
	}));

	it('should be defined', () => {
		expect(contextEntityAppEffects).toBeTruthy();
	});

	it('displayEntityFromCase$ display context entity from selected case', () => {
		const action = new SelectCaseAction(cases[0]);
		actions = hot('--a--', { a: action });
		const expectedResults = cold('--b--', { b: action });
		expect(contextEntityAppEffects.displayEntityFromCase$).toBeObservable(expectedResults);
		expect(visualizer.setEntities).toHaveBeenCalledTimes(3);
	});

	it('displayEntityFromCase$ DOESN\'T display context entity from selected case if context entity isn\'t provided', () => {
		cases[0].state.contextEntities = null;
		const action = new SelectCaseAction(cases[0]);
		actions = hot('--a--', { a: action });
		const expectedResults = cold('-');
		expect(contextEntityAppEffects.displayEntityFromCase$).toBeObservable(expectedResults);
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityFromNewMap$ should display context entity from selected case on new map', () => {
		cases[0].state.contextEntities = fakeContextEntities;
		const communicators: Array<string> = ['imagery2'];
		actions = hot('--a--', {
			a: new AddMapInstanceAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			})
		});
		const expectedResults = cold('--b--', { b: undefined });
		expect(contextEntityAppEffects.displayEntityFromNewMap$).toBeObservable(expectedResults);
		expect(visualizer.setEntities).toHaveBeenCalled();
	});

	it('displayEntityFromNewMap$ should NOT display on new map if doesn\'t exist in case', () => {
		cases[0].state.contextEntities = null;
		const communicators: Array<string> = ['imagery2'];
		actions = hot('--a--', {
			a: new AddMapInstanceAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			})
		});
		const expectedResults = cold('-');
		expect(contextEntityAppEffects.displayEntityFromNewMap$).toBeObservable(expectedResults);
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromOverlay$ should display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = fakeContextEntities;
		spyOn(visualizer, 'setReferenceDate');
		let fakeOverlay = <any>{ id: 'overlayId', isFullOverlay: true };
		actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: fakeOverlay, mapId: 'imagery2' }) });
		const expectedResults = cold('--b--', { b: undefined });
		expect(contextEntityAppEffects.displayEntityTimeFromOverlay$).toBeObservable(expectedResults);
		expect(visualizer.setReferenceDate).toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromOverlay$ should NOT display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = null;
		spyOn(visualizer, 'setReferenceDate');
		let fakeOverlay = <any>{ id: 'overlayId', isFullOverlay: true };
		actions = hot('--a--', { a: new DisplayOverlayAction({ overlay: fakeOverlay, mapId: 'imagery2' }) });
		const expectedResults = cold('-');
		expect(contextEntityAppEffects.displayEntityTimeFromOverlay$).toBeObservable(expectedResults);
		expect(visualizer.setReferenceDate).not.toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromBackToWorld$ should display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = fakeContextEntities;
		spyOn(visualizer, 'setReferenceDate');
		actions = hot('--a--', { a: new BackToWorldAction({ mapId: 'imagery2' }) });
		const expectedResults = cold('--b--', { b: undefined });
		expect(contextEntityAppEffects.displayEntityTimeFromBackToWorld$).toBeObservable(expectedResults);
		expect(visualizer.setReferenceDate).toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});

	it('displayEntityTimeFromBackToWorld$ should NOT display set overlay date to context visualizer', () => {
		cases[0].state.contextEntities = null;
		spyOn(visualizer, 'setReferenceDate');
		actions = hot('--a--', { a: new BackToWorldAction({ mapId: 'imagery2' }) });
		const expectedResults = cold('-');
		expect(contextEntityAppEffects.displayEntityTimeFromBackToWorld$).toBeObservable(expectedResults);
		expect(visualizer.setReferenceDate).not.toHaveBeenCalled();
		expect(visualizer.setEntities).not.toHaveBeenCalled();
	});
});
