import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import {
	DisplayOverlayAction,
	GoNextDisplayAction,
	GoPrevDisplayAction,
	OverlaysMarkupAction, SelectOverlayAction, SetTimelineStateAction, UnSelectOverlayAction,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { DestroySubscribers } from "ng2-destroy-subscribers";
import { isEmpty, isEqual, get, isNil } from 'lodash';
import 'rxjs/add/operator/filter';
import '@ansyn/core/utils/debug';
import '@ansyn/core/utils/store-element';
import '@ansyn/core/utils/compare';
import { OverlaysEffects } from '../effects/overlays.effects';
import { Store } from '@ngrx/store';
import * as overlaysAction from '../actions/overlays.actions';
import { IOverlayState } from '../reducers/overlays.reducer';
import * as d3 from 'd3';
import { OverlaysService } from "../services/overlays.service";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Spinner } from "@ansyn/core/utils";
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'overlays-container',
	templateUrl: './overlays-container.component.html',
	styleUrls: ['./overlays-container.component.less']
})

@DestroySubscribers({
	destroyFunc: 'ngOnDestroy',
})

export class OverlaysContainer implements OnInit, AfterViewInit {
	public drops$: Observable<any[]> = this.store.select('overlays')
		.skip(1)
		.distinctUntilChanged(this.overlaysService.compareOverlays)
		.map((overlaysState: IOverlayState) => {
			return this.overlaysService.parseOverlayDataForDispaly(overlaysState.overlays, overlaysState.filters)
		});

	public timelineState$: Observable<any> = this.store.select('overlays')
		.map((overlaysState: IOverlayState) => overlaysState.timelineState)
		.distinctUntilChanged(isEqual);

	public selectedOverlays$ = this.store.select('overlays')
		.skip(1)
		.distinctUntilChanged((data: IOverlayState, data1: IOverlayState) => isEqual(data.queryParams, data1.queryParams))
		.map((data: IOverlayState) => data.selectedOverlays);

	public drops: any[] = [];
	public redraw$: BehaviorSubject<number>;
	public configuration: any;
	public currentTimelineState;
	public spinner:Spinner;
	private errorMessage: string;

	public initialOverlays: any;
	public selectedOverlays: Array < string > = [];
	public subscribers: any = {};
	public overlaysMarkup: any = [];

	constructor(private store: Store <IOverlayState> ,
				private overlaysService: OverlaysService,
				private emitter: TimelineEmitterService,
				private effects: OverlaysEffects
	)
	{
		this.redraw$ = new BehaviorSubject(0);
		this.configuration = {
			start: new Date(new Date().getTime() - 3600000 * 24 * 365),
			margin: {
				top: 60,
				left: 50,
				bottom: 40,
				right: 50,
			},
			end: new Date(),
			eventLineColor: (d, i) => d3.schemeCategory10[i],
			date: d => new Date(d.date),
			displayLabels: false

		};
	}

	ngOnInit(): void {

		this.init();

	}

	ngAfterViewInit(): void {

		this.subscribers.clickEmitter = this.emitter.provide('timeline:click')
			.subscribe(data => this.toggleOverlay(data.element.id));

		this.subscribers.dblclickEmitter = this.emitter.provide('timeline:dblclick')
			.subscribe(data => {
				const id = data.element.id;
				this.store.dispatch(new overlaysAction.DisplayOverlayAction({id: id}));
				if (this.selectedOverlays.indexOf(id) === -1) {
					this.store.dispatch(new SelectOverlayAction(id));
				}
			});

		this.subscribers.zoomHandler  = this.emitter.provide('timeline:zoomStream')
			.throttleTime(100)
			.subscribe(result => {
				let sum = 0;
				result.counts.forEach( i => sum+=i.count);
				this.store.dispatch(new UpdateOverlaysCountAction(sum));
			});


		this.subscribers.zoomEnd  = this.emitter.provide('timeline:zoomend')
			.subscribe(result => {
				this.currentTimelineState = {from: result.dates.from, to: result.dates.to};
				this.store.dispatch(new SetTimelineStateAction({from: result.dates.from, to: result.dates.to}));
			})

	}

	//maybe to move this to the service
	toggleOverlay(id): void {
		if (this.selectedOverlays.indexOf(id) > -1) {
			this.store.dispatch(new UnSelectOverlayAction(id));
		} else {
			this.store.dispatch(new SelectOverlayAction(id));
		}
	}

	init(): void {

		this.subscribers.overlays = this.drops$.subscribe(_drops => {
			const count = this.calcOverlayCountViaDrops(_drops);
			this.store.dispatch(new UpdateOverlaysCountAction(count));
			this.drops = _drops;
		});

		this.subscribers.timelineState = this.timelineState$
			.subscribe(timelineState => {
				this.configuration.start = timelineState.from;
				this.configuration.end = timelineState.to;
			});

		this.subscribers.selected = this.selectedOverlays$
			.subscribe(selectedOverlays => this.selectedOverlays = selectedOverlays);

		this.subscribers.onRedrawTimeline = this.effects.onRedrawTimeline$.subscribe(() => {
			this.redraw$.next(Math.random());
		});

		this.subscribers.overlaysMarkup = this.effects.onOverlaysMarkupChanged$
			.subscribe((action:OverlaysMarkupAction) => {
				this.overlaysMarkup = action.payload;
			});

		this.subscribers.goPrevDisplay = this.effects.goPrevDisplay$.subscribe((action: GoPrevDisplayAction): any => {
			const indexCurrentOverlay = this.drops[0].data.findIndex((overlay) =>  overlay.id == action.payload);
			const indexPrevOverlay = indexCurrentOverlay - 1;
			const prevOverlayId : any = get(this.drops[0].data[indexPrevOverlay], 'id');
			if (!isNil(prevOverlayId)){
				this.store.dispatch(new DisplayOverlayAction({id: prevOverlayId}));
			}
		});

		this.subscribers.goNextDisplay = this.effects.goNextDisplay$.subscribe((action: GoNextDisplayAction): any => {
			const indexCurrentOverlay = this.drops[0].data.findIndex((overlay) =>  overlay.id == action.payload);
			const indexNextOverlay = indexCurrentOverlay + 1;
			const nextOverlayId: any = get(this.drops[0].data[indexNextOverlay], 'id');
			if(!isNil(nextOverlayId)){
				this.store.dispatch(new DisplayOverlayAction({id: nextOverlayId}))
			}
		});

	}

	calcOverlayCountViaDrops(drops) {
		if(isEmpty(drops)) return 0;
		return drops[0].data.reduce((count, overlays) => {
			if(this.configuration.start <= overlays.date && overlays.date <= this.configuration.end) {
				return count+ 1;
			}
			return count;
		}, 0);
	}

}
