import {
	ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit,
	ViewChild
} from '@angular/core';
import { selection } from 'd3';
import * as d3 from 'd3/build/d3';
import eventDrops from '@ansyn/event-drops';
import { OverlaysService } from '../../services/overlays.service';
import {
	IOverlaysState, MarkUpClass, MarkUpData, MarkUpTypes, OverlayDrop, overlaysStateSelector, selectDropMarkup,
	selectDrops,
	selectTimelineRange,
	TimelineRange
} from '../../reducers/overlays.reducer';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import {
	DisplayOverlayFromStoreAction, OverlaysActionTypes, RedrawTimelineAction,
	SetMarkUp, SetTimelineStateAction
} from '../../actions/overlays.actions';
import { Subscription } from 'rxjs/Subscription';
import { schemeCategory10 } from 'd3-scale';
import { distinctUntilChanged, filter, tap, withLatestFrom } from 'rxjs/internal/operators';
import { isEqual } from 'lodash';
import { ExtendMap } from '../../reducers/extendedMap.class';
import { overlayOverviewComponentConstants } from '../overlay-overview/overlay-overview.component.const';

export const BASE_DROP_COLOR = '#d393e1';
selection.prototype.moveToFront = function () {
	return this.each(function () {
		this.parentNode.appendChild(this);
	});
};

export interface IEventDropsEvent {
	id: string;
	date: Date;
}

@Component({
	selector: 'ansyn-timeline',
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class TimelineComponent implements OnInit, OnDestroy {

	@ViewChild('context') context: ElementRef;

	configuration = {
		range: {
			start: new Date(Date.now()),
			end: new Date(Date.now())
		},
		locale: {
			'dateTime': '%x, %X',
			'date': '%-m/%-d/%Y',
			'time': '%-I:%M:%S %p',
			'periods': ['AM', 'PM'],
			'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		bound: {
			location: '-35'
		},
		margin: {
			top: 60,
			left: 10,
			bottom: 40,
			right: 10
		},
		line: {
			color: (d, i) => schemeCategory10[i]
		},
		drop: {
			onMouseOver: this.onMouseOver.bind(this),
			onMouseOut: this.onMouseOut.bind(this),
			onClick: this.clickEvent(),
			onDblClick: () => event.stopPropagation(),
			dropId: d => 'dropId-' + d.id,
			color: BASE_DROP_COLOR,
			date: d => new Date(d.date),
			filterOverlap: false
		},
		zoom: {
			onZoom: this.drawMarkup.bind(this),
			onZoomStart: null,
			onZoomEnd: this.onZoomEnd.bind(this)
		},
		label: {
			width: 0,
			padding: 0,
			text: ''
		},
		d3: d3
	};

	private chart: any;
	private element: any;
	private oldActiveId: string;

	redraw$ = this.actions$
		.pipe(
			ofType<RedrawTimelineAction>(OverlaysActionTypes.REDRAW_TIMELINE),
			withLatestFrom(this.store$.select(selectDrops)),
			tap(([action, drops]) => this.initEventDropsSequence(drops))
		);

	timeLineRange$: Observable<TimelineRange> = this.store$
		.pipe(
			select(selectTimelineRange),
			tap((value: TimelineRange) => this.configuration.range = value)
		);

	private markup: ExtendMap<MarkUpClass, MarkUpData>;
	dropsMarkUp$: Observable<[ExtendMap<MarkUpClass, MarkUpData>, any]> = this.store$
		.pipe(
			select(selectDropMarkup),
			withLatestFrom(this.store$.pipe(select(selectDrops))),
			tap(this.checkDiffranceInTimeRange.bind(this)),
			tap(([value]: [ExtendMap<MarkUpClass, MarkUpData>, any]) => {
				this.markup = value;
				this.drawMarkup();
			})
		);

	dropsIdMap: Map<string, OverlayDrop> = new Map();
	dropsChange$: Observable<OverlayDrop[]> = this.store$
		.pipe(
			select(selectDrops),
			distinctUntilChanged(isEqual),
			tap(drops => this.dropsIdMap = new Map(drops.map((drop) => [drop.id, drop]))),
			tap(drops => {
				if (drops.length >= 1) {
					this.configuration.range = this.overlaysService.getTimeRangeFromDrops(drops);
				}
				this.initEventDropsSequence(drops);
			})
		);

	private subscribers: Subscription[];

	onResize$ = fromEvent(window, 'resize')
		.pipe(
			withLatestFrom(this.store$.select(selectDrops)),
			tap(([event, drops]) => this.initEventDropsSequence(drops))
		);

	constructor(@Inject(OverlaysService) protected overlaysService: OverlaysService,
				protected store$: Store<IOverlaysState>,
				protected actions$: Actions) {
	}


	ngOnInit() {
		this.subscribers = [this.dropsChange$.subscribe(),
			this.dropsMarkUp$.subscribe(),
			this.timeLineRange$.subscribe(),
			this.redraw$.subscribe(),
			this.onResize$.subscribe()
		];
	}

	ngOnDestroy() {
		this.subscribers.forEach(subscriber => subscriber.unsubscribe());

	}

	onMouseOver({ id }: IEventDropsEvent) {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [id] } }));
	}

	onMouseOut({ id }: IEventDropsEvent) {
		if (d3.event.toElement && d3.event.toElement.id !== overlayOverviewComponentConstants.TRANSPARENT_DIV_ID) {
			this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
		}
	}

	clickEvent() {
		let down, wait;
		return (data: IEventDropsEvent) => {
			if (!down) {
				down = true;
				wait = setTimeout((() => {
					wait = null;
					this.onClick();
					down = false;
				}), 300);
			} else {
				this.onDblClick(data);
				if (wait) {
					window.clearTimeout(wait);
					wait = null;
					down = false;
				}
				return;
			}
		};
	}

	onDblClick({ id }) {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	onClick() {
	}

	onZoomEnd() {
		this.store$.dispatch(new SetTimelineStateAction({
			timeLineRange: {
				start: this.chart.scale().domain()[0],
				end: this.chart.scale().domain()[1]
			}
		}));
	}

	initEventDropsSequence(drops) {
		this.removeOldEventDrops();
		this.initEventDrop(drops);
		this.drawMarkup();
	}

	removeOldEventDrops() {
		if (this.element) {
			const exsitEventDrops = this.element.select('.event-drop-chart');
			if (exsitEventDrops) {
				exsitEventDrops.remove();
			}
		}
	}

	checkDiffranceInTimeRange([newMarkUp, drops]: [ExtendMap<MarkUpClass, MarkUpData>, any]) {
		const newActive = newMarkUp.get(MarkUpClass.active).overlaysIds;
		if (!newActive || !newActive.length) {
			return;
		}
		const newActiveId = newActive[0];
		const isExist = Boolean(this.dropsIdMap.get(newActiveId));
		if (isExist && (!this.oldActiveId || this.oldActiveId !== newActiveId)) {
			const timeLineRange = this.overlaysService.getTimeStateByOverlay(this.dropsIdMap.get(newActiveId), this.configuration.range);
			if (timeLineRange.start.getTime() !== this.configuration.range.start.getTime() ||
				timeLineRange.end.getTime() !== this.configuration.range.end.getTime()
			) {
				this.configuration.range = timeLineRange;
				this.initEventDropsSequence(drops);
			}
		}
		this.oldActiveId = newActiveId;
	}

	initEventDrop(drops): void {
		this.chart = eventDrops(this.configuration);
		this.element = d3.select(this.context.nativeElement);
		this.element
			.data([[{ data: drops }]])
			.call(this.chart);

		this.element.clone().select('.drops').append('g').classed('textContainer', true);
	}

	drawMarkup() {
		if (this.markup && this.element) {
			const dropsElements = this.element.selectAll('.drop');
			const textContainer = this.element.select('.textContainer');
			this.clearMarkUp(dropsElements);
			this.markup.keys.forEach(className => {
				const markUpData = this.markup.get(className);
				markUpData.overlaysIds.forEach(overlayId => {
					const dropElement = dropsElements.filter('#dropId-' + overlayId);
					if (!dropElement.empty()) {
						if (markUpData.type === MarkUpTypes.symbole) {
							this.appendLetters(textContainer, dropElement, markUpData.data);
						}
						else {
							const currentClassList = dropElement.attr('class');
							dropElement.attr('class', currentClassList.concat(' changedDrops ' + className));
						}
					}

				});
			});
			this.arrangeDrops(dropsElements, textContainer);
		}
	}

	appendLetters(textContainer, dropElement, symbol) {
		textContainer.append('text')
			.classed('letters', true)
			.attr('x', dropElement.attr('cx'))
			.attr('y', dropElement.attr('cy') + 2)
			.attr('text-anchor', 'middle')
			.attr('fill', 'white')
			.attr('font-size', '12px')
			.attr('alignment-baseline', 'auto')
			.text(symbol);
	}

	clearMarkUp(dropsElements) {
		dropsElements.filter('.changedDrops').attr('class', 'drop').style('filter', null);
		this.element.selectAll('.letters').remove();
	}

	arrangeDrops(drops, textContainer) {
		const changeDrops = drops.filter('.changedDrops');
		if (!changeDrops.empty()) {
			this.moveToFront(changeDrops);
			const activeDrops = changeDrops.filter('.' + MarkUpClass.active);
			if (!activeDrops.empty()) {
				this.moveToFront(activeDrops);
			}
			const favoriteDrops = changeDrops.filter('.' + MarkUpClass.favorites);
			if (!favoriteDrops.empty()) {
				this.moveToFront(favoriteDrops);
				favoriteDrops.style('filter', 'url(#highlight)');
			}
		}
		this.moveToFront(textContainer);
	}

	moveToFront(element) {
		element.each(function () {
			this.parentNode.appendChild(this);
		});
	}

}



