import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { TimelineEmitterService } from '../../services/timeline-emitter.service';
import * as overlaysAction from '../../actions/overlays.actions';
import {
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysMarkupAction,
	SelectOverlayAction,
	SetTimelineStateAction,
	UnSelectOverlayAction
} from '../../actions/overlays.actions';
import { first } from 'lodash';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/store-element';
import { OverlaysEffects } from '../../effects/overlays.effects';
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector, TimelineState } from '../../reducers/overlays.reducer';
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
		])
	])
];

@Component({
	selector: 'ansyn-overlays-container',
	templateUrl: './overlays-container.component.html',
	styleUrls: ['./overlays-container.component.less'],
	animations
})

export class OverlaysContainerComponent implements OnInit, OnDestroy {
	drops: any[] = [];
	redraw$: EventEmitter<any> = new EventEmitter();
	selectedOverlays: Array<string> = [];
	subscribers: any = {};
	overlaysMarkup: any = [];
	loading: boolean;
	noDrops: boolean;
	timelineState: TimelineState;

	overlaysState$: Observable<IOverlaysState> = this.store$.select(overlaysStateSelector);

	timelineState$: Observable<TimelineState> = this.overlaysState$
		.pluck <IOverlaysState, TimelineState>('timelineState')
		.distinctUntilChanged();

	overlaysLoader$: Observable<any> = this.overlaysState$
		.pluck <IOverlaysState, boolean>('loading')
		.distinctUntilChanged();

	constructor(protected store$: Store<IOverlaysState>,
				protected emitter: TimelineEmitterService,
				protected effects$: OverlaysEffects) {
	}

	ngOnInit(): void {
		this.setStoreSubscribers();
		this.setEmitterSubscribers();
	}

	// maybe to move this to the service
	clickOverlay(d): void {
		console.log("click event" + d.id)
		// there is no action now for selection of overlay...
		// if (this.selectedOverlays.includes(d.id)) {
		// 	this.store$.dispatch(new UnSelectOverlayAction(d.id));
		// } else {
		// 	this.store$.dispatch(new SelectOverlayAction(d.id));
		// }
	}

	dblClickOverlay(d) {
		console.log("dblClick" + d.id)
		startTimingLog(`LOAD_OVERLAY_${d.id}`);
		this.store$.dispatch(new overlaysAction.DisplayOverlayFromStoreAction({ id: d.id }));
		// there is no action now for selection of overlay...
		// if (!this.selectedOverlays.includes(id)) {
		// 	this.store$.dispatch(new SelectOverlayAction(id));
		// }
	}

	setStoreSubscribers(): void {

		this.subscribers.drops = this.effects$.drops$.subscribe((drops) => {
			this.drops = drops;
			this.noDrops = !(first(drops).data.length);
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
			.subscribe(this.clickOverlay.bind(this));
		this.subscribers.dblclickEmitter = this.emitter.provide('timeline:dblclick')
			.subscribe(this.dblClickOverlay.bind(this));
		this.subscribers.mouseOver = this.emitter.provide('timeline:mouseover')
			.subscribe(result => {
				this.store$.dispatch(new MouseOverDropAction(result.id));
			});
		this.subscribers.zoomEnd = this.emitter.provide('timeline:zoomend')
			.subscribe((dates: TimelineState ) => {
				this.store$.dispatch(new SetTimelineStateAction({ state: dates, noRedraw: true }));
			});

		this.subscribers.mouseout = this.emitter.provide('timeline:mouseout')
			.subscribe(result => {
				this.store$.dispatch(new MouseOutDropAction(result.id));
			});
	};

	ngOnDestroy(): void {
		Object.keys(this.subscribers).forEach((s) => this.subscribers[s].unsubscribe());
	}
}


