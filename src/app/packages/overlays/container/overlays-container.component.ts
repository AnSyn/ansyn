import { Component, EventEmitter, OnInit } from '@angular/core';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import * as overlaysAction from '../actions/overlays.actions';
import {
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysMarkupAction,
	SelectOverlayAction,
	SetTimelineStateAction,
	UnSelectOverlayAction
} from '../actions/overlays.actions';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { first } from 'lodash';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/skip';
import '@ansyn/core/utils/store-element';
import { OverlaysEffects } from '../effects/overlays.effects';
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector, TimelineState } from '../reducers/overlays.reducer';
import { schemeCategory10 } from 'd3';
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

export class OverlaysContainerComponent implements OnInit {
	drops: any[] = [];
	redraw$: EventEmitter<any> = new EventEmitter();
	selectedOverlays: Array<string> = [];
	subscribers: any = {};
	overlaysMarkup: any = [];
	loading: boolean;
	noDrops: boolean;
	timelineState: TimelineState;
	configuration: any = {
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

	overlaysState$: Observable<IOverlaysState> = this.store$.select(overlaysStateSelector);

	timelineState$: Observable<TimelineState> = this.overlaysState$
		.pluck <IOverlaysState, TimelineState>('timelineState')
		.distinctUntilChanged();

	overlaysLoader$: Observable<any> = this.overlaysState$
		.pluck <IOverlaysState, boolean>('loading')
		.distinctUntilChanged();

	constructor(private store$: Store<IOverlaysState>,
				private emitter: TimelineEmitterService,
				private effects$: OverlaysEffects) {
	}

	ngOnInit(): void {
		this.setStoreSubscribers();
		this.setEmitterSubscribers();
	}

	// maybe to move this to the service
	toggleOverlay(id): void {
		if (this.selectedOverlays.includes(id)) {
			this.store$.dispatch(new UnSelectOverlayAction(id));
		} else {
			this.store$.dispatch(new SelectOverlayAction(id));
		}
	}

	setStoreSubscribers(): void {

		this.subscribers.drops = this.effects$.drops$.subscribe((drops) => {
			this.drops = drops;
			this.noDrops = !(first(drops).data.length);
		});

		this.subscribers.timelineState = this.timelineState$
			.subscribe(timelineState => {
				this.timelineState = timelineState;
				this.configuration.start = timelineState.from;
				this.configuration.end = timelineState.to;
			});

		this.subscribers.overlaysLoader = this.overlaysLoader$.subscribe(loading => {
			this.loading = loading;
		});

		this.subscribers.onRedrawTimeline = this.effects$.onRedrawTimeline$.subscribe(() => {
			this.redraw$.emit();
		});

		this.subscribers.overlaysMarkup = this.effects$.onOverlaysMarkupChanged$
			.subscribe((action: OverlaysMarkupAction) => {
				this.overlaysMarkup = action.payload;
			});
	}

	setEmitterSubscribers() {

		this.subscribers.clickEmitter = this.emitter.provide('timeline:click')
			.subscribe(data => this.toggleOverlay(data.element.id));

		this.subscribers.dblclickEmitter = this.emitter.provide('timeline:dblclick')
			.subscribe(data => {
				const id = data.element.id;
				startTimingLog(`LOAD_OVERLAY_${id}`);
				this.store$.dispatch(new overlaysAction.DisplayOverlayFromStoreAction({ id: id }));
				if (!this.selectedOverlays.includes(id)) {
					this.store$.dispatch(new SelectOverlayAction(id));
				}
			});

		this.subscribers.zoomEnd = this.emitter.provide('timeline:zoomend')
			.subscribe((result: { dates: TimelineState }) => {
				this.store$.dispatch(new SetTimelineStateAction({ state: { ...result.dates }, noRedraw: true }));
			});

		this.subscribers.mouseOver = this.emitter.provide('timeline:mouseover')
			.subscribe(result => {
				this.store$.dispatch(new MouseOverDropAction(result.id));
			});

		this.subscribers.mouseout = this.emitter.provide('timeline:mouseout')
			.subscribe(result => {
				this.store$.dispatch(new MouseOutDropAction(result.id));
			});
	};

}
