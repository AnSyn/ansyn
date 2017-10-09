import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import * as overlaysAction from '../actions/overlays.actions';
import {
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysMarkupAction,
	SelectOverlayAction,
	SetTimelineStateAction,
	UnSelectOverlayAction,
	UpdateOverlaysCountAction
} from '../actions/overlays.actions';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { first } from 'lodash';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/skip';
import '@ansyn/core/utils/store-element';
import '@ansyn/core/utils/compare';
import { OverlaysEffects } from '../effects/overlays.effects';
import { Store } from '@ngrx/store';
import { IOverlayState } from '../reducers/overlays.reducer';
import { schemeCategory10 } from 'd3';
import { OverlaysService } from '../services/overlays.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { startTimingLog } from '@ansyn/core/utils';
import { Observable } from 'rxjs/Observable';
import { animate, style, transition, trigger } from '@angular/animations';

const animations: any[] = [
	trigger('timeline-status', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('0.2s', style({ opacity: 1 }))
		]),
		transition(':leave', [
			style({ opacity: 1 }),
			animate('0.2s', style({ opacity: 0 }))
		]),
	])
];

@Component({
	selector: 'ansyn-overlays-container',
	templateUrl: './overlays-container.component.html',
	styleUrls: ['./overlays-container.component.less'],
	animations
})

@DestroySubscribers({
	destroyFunc: 'ngOnDestroy',
})

export class OverlaysContainerComponent implements OnInit, AfterViewInit {
	public drops: any[] = [];
	public redraw$: BehaviorSubject<number>;
	public configuration: any;
	public currentTimelineState = {
		from: undefined,
		to: undefined
	};
	public selectedOverlays: Array<string> = [];
	public subscribers: any = {};
	public overlaysMarkup: any = [];
	public loading: boolean;
	public noDrops: boolean;

	public drops$: Observable<any> = this.store.select <IOverlayState>('overlays')
		.skip(1)
		.do(({ timelineState }: IOverlayState) => this.setConfigurationTime(timelineState.from, timelineState.to))
		.map(({ overlays, filteredOverlays, specialObjects }: IOverlayState) => this.overlaysService.parseOverlayDataForDispaly(overlays, filteredOverlays, specialObjects))
		.do((drops): void => {
			this.store.dispatch(new UpdateOverlaysCountAction(drops[0].data.length));
			this.noDrops = Boolean(first(drops).data.length === 0);
		});

	public timelineState$: Observable<any> = this.store.select('overlays')
		.map((overlaysState: IOverlayState) => overlaysState.timelineState)
		.distinctUntilChanged()
		.filter(timelineState => {
			return timelineState && timelineState.to && timelineState.from && this.currentTimelineState.from && this.currentTimelineState.to;
		})
		.filter(timelineState => {
			return (timelineState.from.getTime() !== this.currentTimelineState.from.getTime() || timelineState.to.getTime() !== this.currentTimelineState.to.getTime());
		});

	public overlaysLoader$: Observable<any> = this.store.select('overlays')
		.map((overlayState: IOverlayState) => overlayState.loading)
		.distinctUntilChanged();


	/*
		// this is not needed for now maybe will be needed for later use
		public selectedOverlays$ = this.store.select('overlays')
		.skip(1)
		.distinctUntilChanged((data: IOverlayState, data1: IOverlayState) => isEqual(data.queryParams, data1.queryParams))
		.map((data: IOverlayState) => data.selectedOverlays);
	*/

	constructor(private store: Store<IOverlayState>,
				private overlaysService: OverlaysService,
				private emitter: TimelineEmitterService,
				private effects: OverlaysEffects) {
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
			eventLineColor: (d, i) => schemeCategory10[i],
			date: d => new Date(d.date),
			displayLabels: false,
			shapes: {
				star: {
					fill: 'green',
					offsetY: 20,
				}

			}

		};

		this.currentTimelineState.from = this.configuration.start;
		this.currentTimelineState.to = this.configuration.end;
	}

	ngOnInit(): void {
		this.setSubscribers();
	}

	ngAfterViewInit(): void {

		this.subscribers.clickEmitter = this.emitter.provide('timeline:click')
			.subscribe(data => this.toggleOverlay(data.element.id));

		this.subscribers.dblclickEmitter = this.emitter.provide('timeline:dblclick')
			.subscribe(data => {
				const id = data.element.id;
				startTimingLog(`LOAD_OVERLAY_${id}`);
				this.store.dispatch(new overlaysAction.DisplayOverlayFromStoreAction({ id: id }));
				if (!this.selectedOverlays.includes(id)) {
					this.store.dispatch(new SelectOverlayAction(id));
				}
			});

		this.subscribers.zoomEnd = this.emitter.provide('timeline:zoomend')
			.subscribe(result => {
				this.currentTimelineState = { from: result.dates.from, to: result.dates.to };
				this.store.dispatch(new SetTimelineStateAction({ from: result.dates.from, to: result.dates.to }));
			});

		this.subscribers.mouseOver = this.emitter.provide('timeline:mouseover')
			.subscribe(result => {
				this.store.dispatch(new MouseOverDropAction(result.id));
			});

		this.subscribers.mouseout = this.emitter.provide('timeline:mouseout')
			.subscribe(result => {
				this.store.dispatch(new MouseOutDropAction(result.id));
			});

	}

	// maybe to move this to the service
	toggleOverlay(id): void {
		if (this.selectedOverlays.includes(id)) {
			this.store.dispatch(new UnSelectOverlayAction(id));
		} else {
			this.store.dispatch(new SelectOverlayAction(id));
		}
	}

	setSubscribers(): void {

		this.subscribers.drops = this.drops$.subscribe((drops) => {
			this.drops = drops;
		});

		this.subscribers.timelineState = this.timelineState$
			.subscribe(timelineState => {
				this.setConfigurationTime(timelineState.from, timelineState.to);
			});

		this.subscribers.overlaysLoader = this.overlaysLoader$.subscribe(loading => {
			this.loading = loading;
		});

		this.subscribers.onRedrawTimeline = this.effects.onRedrawTimeline$.subscribe(() => {
			this.setConfigurationTime(this.currentTimelineState.from, this.currentTimelineState.to);
			this.redraw$.next(Math.random());
		});

		this.subscribers.overlaysMarkup = this.effects.onOverlaysMarkupChanged$
			.subscribe((action: OverlaysMarkupAction) => {
				this.overlaysMarkup = action.payload;
			});
	}

	setConfigurationTime(from: Date, to: Date) {
		this.configuration.start = from;
		this.configuration.end = to;
	}

}
