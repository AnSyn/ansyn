import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { CasesService, ICase, LoadDefaultCaseAction, SelectDilutedCaseAction } from '@ansyn/ansyn';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { ImageryCommunicatorService, } from '@ansyn/imagery';
import { ContextAppEffects } from './context.app.effects';
import { SetContextParamsAction } from '../actions/context.actions';
import {
	contextFeatureKey,
	ContextReducer,
	contextStateSelector,
	selectContextMapPosition
} from '../reducers/context.reducer';
import { ContextConfig, ContextName } from '../models/context.config';
import { Point } from '@turf/helpers';
import { TranslateModule } from '@ngx-translate/core';

describe('ContextAppEffects', () => {
	let contextAppEffects: ContextAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let casesService: CasesService;
	let imageryCommunicatorServiceMock = {
		provide: () => ({
			instanceCreated: () => of({ id: 'imagery1' }),
		})
	};
	const caseItem: ICase = {
		'id': '31b33526-6447-495f-8b52-83be3f6b55bd',
		'state': {
			'region': {
				'type': 'FeatureCollection',
				'features': [{
					'type': 'Feature',
					'properties': {
						'MUN_HEB': 'Hasharon',
						'MUN_ENG': 'Hasharon'
					},
					'geometry': {
						'type': 'Polygon',
						'coordinates': [
							[
								[35.71991824722275, 32.709192409794866],
								[35.54566531753454, 32.393992011030576]
							]


						]
					}
				}
				]
			},
			'time': {
				'type': 'absolute',
				'from': new Date('2013-06-27T08:43:03.624Z'),
				'to': new Date('2015-04-17T03:55:12.129Z')
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
					[contextFeatureKey]: ContextReducer
				}),
				TranslateModule.forRoot()
			],
			providers: [
				ContextAppEffects,
				provideMockActions(() => actions),
				{
					provide: CasesService,
					useValue: {
						defaultCase: () => caseItem
					}
				},
				{
					provide: ContextConfig,
					useValue: {}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store, CasesService], (_store, _casesService) => {
		store = _store;
		casesService = _casesService;
		const fakeStore = new Map<any, any>([
			[contextStateSelector, { params: {} }],
			[selectContextMapPosition, { type: 'Point', coordinates: [31.222, 33.212] }]
		]);

		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	it('should be defined', () => {
		expect(contextAppEffects).toBeTruthy();
	});

	it('on load case with area analysis context fire SelectDilutedCaseAction and update params', () => {
		actions = hot('-a-', {
			a: new LoadDefaultCaseAction({
				context: ContextName.AreaAnalysis,
				geometry: 'POINT(-117.91897 34.81265)'
			})
		});
		const contextCase = { ...casesService.defaultCase };
		const to = new Date();
		const from = new Date(to);
		const geo: Point = { type: 'Point', coordinates: [-117.91897, 34.81265] };
		from.setMonth(from.getMonth() - 2);
		contextCase.state = {
			...contextCase.state,
			time: { ...contextCase.state.time, to, from },
			region: geo
		};
		const expectedResult = cold('-ab-', {
				a: new SelectDilutedCaseAction(contextCase),
				b: new SetContextParamsAction({ position: geo })
			}
		);

		expect(contextAppEffects.loadDefaultCaseContext$).toBeObservable(expectedResult);
	})

})
;
