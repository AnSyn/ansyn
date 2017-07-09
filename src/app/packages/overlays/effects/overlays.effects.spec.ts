import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { TestBed, inject } from '@angular/core/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
	LoadOverlaysAction, LoadOverlaysSuccessAction,
	OverlaysMarkupAction, OverlaysActionTypes, RedrawTimelineAction, DisplayOverlayAction, SetTimelineStateAction
} from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService,OverlaysConfig } from '../services/overlays.service';
import { configuration } from '../../../../configuration/configuration';
import { OverlayReducer } from '../reducers/overlays.reducer';
import { CasesReducer } from '../../menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../../../app-reducers/app-reducers.module';

describe("Overlays Effects ", () => {
	const overlays = <Overlay[]>[
		{
			id: '12',
			name: 'tmp12',
			photoTime: new Date(Date.now()).toISOString(),
			azimuth: 10,
			footprint: {}
		},
		{
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()).toISOString(),
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
				useValue: jasmine.createSpyObj('overlaysService', ['getByCase','search', 'getTimeStateByOverlay'])
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
			date: new Date(i.photoTime),
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

	describe('displayOverlaySetTimeline$ should have been dispatch when overlay is displaying on active map, and timeline should be moved', () => {
		it('should be moved forward', () => {
			const { runner, overlaysEffects, overlaysService, overlaysConfig } = setup();
			const getTimeStateByOverlayResult = {from: new Date(1500), to: new Date(6500) };
			overlaysService.getTimeStateByOverlay.and.callFake(() => getTimeStateByOverlayResult);

			const overlays = [
				{id: '1234', date: new Date(6000)}
			];
			const timelineState = {
				from: new Date(0),
				to: new Date(5000)
			};
			store.dispatch(new LoadOverlaysSuccessAction(overlays as any));
			store.dispatch(new SetTimelineStateAction(timelineState));

			const action = new DisplayOverlayAction({id: '1234'});
			runner.queue(action);

			overlaysEffects.displayOverlaySetTimeline$.subscribe((result: SetTimelineStateAction) => {
				expect(result instanceof SetTimelineStateAction).toBeTruthy();
				expect(overlaysService.getTimeStateByOverlay).toHaveBeenCalled();
				expect(result.payload).toEqual(getTimeStateByOverlayResult);
			})
		});

		it('should be moved backards', () => {

			const { runner, overlaysEffects, overlaysService, overlaysConfig } = setup();
			const getTimeStateByOverlayResult = {from: new Date(1500), to: new Date(6500) };
			overlaysService.getTimeStateByOverlay.and.callFake(() => getTimeStateByOverlayResult);

			const overlays = [
				{id: '5678', date: new Date(4000)}
			];
			const timelineState = {
				from: new Date(5000),
				to: new Date(10000)
			};
			store.dispatch(new LoadOverlaysSuccessAction(overlays as any));
			store.dispatch(new SetTimelineStateAction(timelineState));

			const action = new DisplayOverlayAction({id: '5678'});
			runner.queue(action);

			overlaysEffects.displayOverlaySetTimeline$.subscribe((result: SetTimelineStateAction) => {
				expect(result instanceof SetTimelineStateAction).toBeTruthy();
				expect(overlaysService.getTimeStateByOverlay).toHaveBeenCalled();
				expect(result.payload).toEqual(getTimeStateByOverlayResult);
			})
		});
	});
	// @Effect()
	// displayOverlaySetTimeline$ = this.actions$
	// 	.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
	// 	.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: DisplayOverlayAction, overlays: IOverlayState, cases: ICasesState) => {
	// 		const displayedOverlay = overlays.overlays.get(action.payload.id);
	// 		const timelineState = overlays.timelineState;
	// 		const isActiveMap: boolean = _.isNil(action.payload.map_id) || _.isEqual(cases.selected_case.state.maps.active_map_id, action.payload.map_id);
	// 		return [isActiveMap, displayedOverlay, timelineState];
	// 	})
	// 	.filter(([isActiveMap, displayedOverlay, timelineState]: [boolean, Overlay, any]) => {
	// 		return isActiveMap && (displayedOverlay.date < timelineState.from || timelineState.to < displayedOverlay.date);
	// 	})
	// 	.map(([isActiveMap, displayedOverlay, timelineState]:[Overlay, Overlay, any]) => {
	// 		const timeState = this.overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
	// 		return new SetTimelineStateAction(timeState);
	// 	})
	// 	.share();

});
