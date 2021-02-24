import { inject, TestBed, fakeAsync } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import {
	CasesService,
	ICase,
	LoadDefaultCaseAction, LoggerService,
	OverlaysService,
	SelectCaseAction
} from '@ansyn/ansyn';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { ContextAppEffects } from './context.app.effects';
import {
	contextFeatureKey,
	ContextReducer,
	contextStateSelector
} from '../reducers/context.reducer';
import { ContextConfig, ContextName } from '../models/context.config';
import { Point } from '@turf/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { mapFeatureKey, MapReducer, selectActiveMapId } from '@ansyn/map-facade';
import { Auth0Service } from '../../imisight/auth0.service';

describe('ContextAppEffects', () => {
	let contextAppEffects: ContextAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let auth0Service: Auth0Service;
	const caseItem: ICase = {
		id: '31b33526-6447-495f-8b52-83be3f6b55bd',
		state: {
			region: {
				type: 'Polygon',
				coordinates: [
					[
						[35.71991824722275, 32.709192409794866],
						[35.54566531753454, 32.393992011030576]
					]
				]
			},
			time: {
				from: new Date('2013-06-27T08:43:03.624Z'),
				to: new Date('2015-04-17T03:55:12.129Z')
			},
			maps: {
				data: [
					{ id: 'imagery1', data: {} },
				],
				activeMapId: 'imagery1'
			}
		}
	} as any;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[contextFeatureKey]: ContextReducer,
					[mapFeatureKey]: MapReducer
				}),
				TranslateModule.forRoot()
			],
			providers: [
				ContextAppEffects,
				provideMockActions(() => actions),
				{
					provide: CasesService,
					useValue: {
						defaultCase: caseItem,
						defaultTime: {to: new Date(), from: new Date()},
						updateCaseViaContext: () => ({})
					}
				},
				{
					provide: Auth0Service,
					useValue: {
						setSession: () => ({})
					}
				},
				{
					provide: ContextConfig,
					useValue: {}
				},
				{
					provide: OverlaysService,
					useValue: {
						getSensorTypeAndProviderFromSensorName: () => {}
					}
				},
				{
					provide: LoggerService,
					useValue: {
						info: () => {}
					}
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store, CasesService, ContextAppEffects, Auth0Service, OverlaysService], (_store, _casesService, _contextAppEffects, _auth0Service, _overlaysService) => {
		contextAppEffects = _contextAppEffects;
		store = _store;
		casesService = _casesService;
		auth0Service = _auth0Service;
		overlaysService = _overlaysService;
		const fakeStore = new Map<any, any>([
			[selectActiveMapId, 'imagery1'],
			[contextStateSelector, { params: {} }]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	it('should be defined', () => {
		expect(contextAppEffects).toBeTruthy();
	});

	it('on load case with area analysis context fire SelectDilutedCaseAction and update params', fakeAsync(() => {
		actions = hot('-a-', {
			a: new LoadDefaultCaseAction({
				context: ContextName.AreaAnalysis,
				geometry: 'POINT(-117.91897 34.81265)'
			})
		});
		const contextCase = {...casesService.defaultCase,  id: ContextName.AreaAnalysis,  };
		const to = new Date();
		const from = new Date(to);
		const geo: Point = { type: 'Point', coordinates: [-117.91897, 34.81265] };
		from.setMonth(from.getMonth() - 2);
		contextCase.state = {
			...contextCase.state,
			time: { to, from },
			region: geo
		};
		const expectedResult = cold('-a-', {
				a: new SelectCaseAction(contextCase),
			}
		);
		spyOn(casesService, 'updateCaseViaContext').and.callFake((ctx, c , p) => contextCase);
		expect(contextAppEffects.loadDefaultCaseContext$).toBeObservable(expectedResult);
	}));

	it('on load case with quick search context fire SelectDilutedCaseAction and update params', fakeAsync(() => {
		actions = hot('-a-', {
			a: new LoadDefaultCaseAction({
				context: ContextName.QuickSearch,
				geometry: 'POINT(-117.91897 34.81265)',
				time: '2020-05-23,2020-06-23',
				sensors: 'Landsat8'
			})
		});
		const contextCase = {...casesService.defaultCase };
		const to = new Date('2020-06-23');
		const from = new Date('2020-05-23');
		const geo: Point = { type: 'Point', coordinates: [-117.91897, 34.81265] };
		const sensors = ["Landsat8"];
		contextCase.state = {
			...contextCase.state,
			time: { to, from },
			region: geo,
			advancedSearchParameters: {
				...contextCase.state.advancedSearchParameters,
				sensors: sensors
			}
		};
		const expectedResult = cold('-a-', {
				a: new SelectCaseAction(contextCase),
			}
		);
		spyOn(casesService, 'updateCaseViaContext')
			.and.callFake((ctx, c , p) => {
				return { ...contextCase,
					state: { ...contextCase.state,
						time: ctx.time, advancedSearchParameters: {
						...contextCase.state.advancedSearchParameters,
							sensors: sensors
						} }};
		});
		expect(contextAppEffects.loadDefaultCaseContext$).toBeObservable(expectedResult);
	}))
})
;
