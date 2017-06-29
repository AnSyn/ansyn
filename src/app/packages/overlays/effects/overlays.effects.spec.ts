import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';


import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { Injectable } from '@angular/core';
import { Action, Store, StoreModule } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable, ObservableInput } from 'rxjs/Observable';
import {
	SelectOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction, LoadOverlaysFailAction, ClearFilterAction,
	SetFilterAction, OverlaysMarkupAction, OverlaysActionTypes, RedrawTimelineAction
} from '../actions/overlays.actions';
//import * as collection from '../actions/collection';

import { Overlay } from '../models/overlay.model';
import * as overlay from '../actions/overlays.actions';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService,OverlaysConfig } from '../services/overlays.service';
import { configuration } from '../../../../configuration/configuration';
import { OverlayReducer } from '../reducers/overlays.reducer';
import { CasesReducer } from '../../menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../../../app-reducers/app-reducers.module';
import { AddCaseSuccessAction, SelectCaseByIdAction } from '../../menu-items/cases/actions/cases.actions';

describe("Overlays Effects ", () => {
	const overlays = <Overlay[]>[
		{
			id: '12',
			name: 'tmp12',
			photoTime: new Date(Date.now()),
			azimuth: 10,
			footprint: {}
		},
		{
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()),
			azimuth: 10,
			footprint: {}
		}
	];
	let store: Store<IAppState>;
	beforeEach(() => TestBed.configureTestingModule({
		imports: [
			EffectsTestingModule,
			StoreModule.provideStore({ overlays: OverlayReducer, cases: CasesReducer })
		],
		providers: [
			OverlaysEffects, {
				provide: OverlaysService,
				useValue: jasmine.createSpyObj('overlaysService', ['getByCase','search'])
			},
			{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig }
		]
	}));

	beforeEach(inject([Store],(_store: Store<any>) =>{
		store = _store;
	/*	spyOn(store, 'select').and.returnValue((type)=>{
			if(type == "cases"){
				return Observable.of({
					selected_case : {}
				} as any);
			}
		} );*/
	}));

	function setup() {
		return {
			runner: TestBed.get(EffectsRunner),
			overlaysEffects: TestBed.get(OverlaysEffects),
			overlaysService: TestBed.get(OverlaysService),
			overlaysConfig: TestBed.get(OverlaysConfig)
		};
	};

	it('effect - onOverlaysMarkupChanged$',() => {
		const { runner, overlaysEffects } = setup();
		const action = new OverlaysMarkupAction({});

		runner.queue(action);
		let count = 0;
		overlaysEffects.onOverlaysMarkupChanged$.subscribe((action:Action) =>{
			count++;
			expect(action.type).toEqual(OverlaysActionTypes.OVERLAYS_MARKUPS);
		});

		expect(count).toBe(1)
	});


	it('effect - onRedrawTimeline$',() => {
		const { runner, overlaysEffects } = setup();
		const action = new RedrawTimelineAction();
		runner.queue(action);
		let count = 0;
		overlaysEffects.onRedrawTimeline$.subscribe((result:boolean) =>{
			count++;
			expect(result).toBe(true);
		});
		expect(count).toBe(1)
	});

	it('it should load all the overlays', () => {
		const { runner, overlaysEffects, overlaysService, overlaysConfig } = setup();
		let tmp = <Overlay[]>[];
		overlays.forEach(i => tmp.push(Object.assign({}, i,{
			date :i.photoTime,
			sourceType: overlaysConfig.overlaySource
		})));
		const expectedResult = new LoadOverlaysSuccessAction(tmp);

		overlaysService.getByCase.and.returnValue(Observable.of(overlays));
		overlaysService.search.and.returnValue(Observable.of(overlays));
		runner.queue(new LoadOverlaysAction());

		let result = null;
		overlaysEffects.loadOverlays$.subscribe(_result => {
			result = _result;
		});



		expect(result).toEqual(expectedResult);

	});
});
