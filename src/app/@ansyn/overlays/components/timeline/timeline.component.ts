import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostListener,
	Inject,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { schemeCategory10, selection } from 'd3';
import * as d3 from 'd3/build/d3';
import eventDrops from 'new-ansyn-event-drops';
import { OverlaysService } from '../../services';
import { OverlayDrop, OverlayLine } from '@ansyn/overlays/reducers';
import {
	IOverlaysState,
	MarkUpClass,
	MarkUpData,
	MarkUpTypes,
	overlaysStateSelector,
	TimelineRange
} from '../../reducers/overlays.reducer';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';
import { select, selectAll } from 'd3-selection';
import { Observable } from 'rxjs/Observable';
import { OverlaysEffects } from '@ansyn/overlays/effects/overlays.effects';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import {
	DisplayOverlayFromStoreAction,
	OverlaysActionTypes,
	SetTimelineStateAction,
	SetMarkUp
} from '../../actions/overlays.actions';
import { Subscription } from 'rxjs/Subscription';
import { RedrawTimelineAction } from '@ansyn/overlays';

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
	private dblClick: number;
	private oldActiveId: string;

	redraw$ = this.actions$.ofType<RedrawTimelineAction>(OverlaysActionTypes.REDRAW_TIMELINE)
		.do(() => this.initEventDropsSequence());

	overlaysState$: Observable<IOverlaysState> = this.store$.select(overlaysStateSelector);

	timeLineRange$: Observable<TimelineRange> = this.overlaysState$
		.pluck <IOverlaysState, TimelineRange>('timeLineRange')
		.distinctUntilChanged()
		.filter(Boolean)
		.do((value: TimelineRange) => {
			this.configuration.range = value;
		});


	private markup: ExtendMap<MarkUpClass, MarkUpData>;
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, MarkUpData>> = this.overlaysState$
		.pluck <IOverlaysState, ExtendMap<MarkUpClass, MarkUpData>>('dropsMarkUp')
		.distinctUntilChanged()
		.do(this.checkDiffranceInTimeRange.bind(this))
		.do((value: ExtendMap<MarkUpClass, MarkUpData>) => {
			this.markup = value;
			this.drawMarkup();
		});

	dropsIdMap: Map<string, OverlayDrop> = new Map();
	drops: Array<OverlayLine> = [];
	dropsChange$ = this.effects$.drops$
		.map((drops) => drops.map(entities => ({
			name: entities.name || '',
			data: entities.data
		})))
		.filter((drops) => Boolean(drops && drops[0] && drops[0].data))
		.do(drops => {
			drops[0].data.forEach(drop => {
				this.dropsIdMap.set(drop.id, drop);
			});
		})
		.do(drops => {
			this.drops = drops;
			if (this.drops[0].data.length) {
				this.configuration.range = this.overlaysService.getTimeRangeFromDrops(this.drops[0].data);
			}
			this.initEventDropsSequence();
		});
	private subscribers: Subscription[];

	@HostListener('window:resize')
	onresize() {
		this.initEventDropsSequence();
	}

	constructor(@Inject(OverlaysService) protected overlaysService: OverlaysService,
				protected store$: Store<IOverlaysState>,
				protected effects$: OverlaysEffects,
				protected actions$: Actions) {
	}


	ngOnInit() {
		this.subscribers = [this.dropsChange$.subscribe(),
			this.dropsMarkUp$.subscribe(),
			this.timeLineRange$.subscribe(),
			this.redraw$.subscribe()
		];
	}

	ngOnDestroy() {
		this.subscribers.forEach(subscriber => subscriber.unsubscribe());

	}

	onMouseOver({ id }: IEventDropsEvent) {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [id] } }));
	}

	onMouseOut({ id }: IEventDropsEvent) {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
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

	initEventDropsSequence() {
		if (this.drops && this.drops.length) {
			this.removeOldEventDrops();
			this.initEventDrop();
			if (this.markup) {
				this.drawMarkup();
			}
		}
	}

	removeOldEventDrops() {
		const exsitEventDrops = d3.select('.event-drop-chart');
		if (exsitEventDrops) {
			exsitEventDrops.remove();
		}
	}

	checkDiffranceInTimeRange(newMarkUp: ExtendMap<MarkUpClass, MarkUpData>) {
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
				this.initEventDropsSequence();
			}
		}
		this.oldActiveId = newActiveId;
	}

	initEventDrop(): void {
		this.chart = eventDrops(this.configuration);
		this.element = d3.select(this.context.nativeElement);
		this.element
			.data([this.drops])
			.call(this.chart);

		select('.drops').append('g').classed('textContainer', true);
	}

	drawMarkup() {
		if (this.markup && this.element) {
			const dropsElements = selectAll('.drop');
			const textContainer = select('.textContainer');
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
		selectAll('.letters').remove();
	}

	arrangeDrops(drops, textContainer) {
		const changeDrops = drops.filter('.changedDrops');
		if (!changeDrops.empty()) {
			changeDrops.moveToFront();
			const activeDrops = changeDrops.filter('.' + MarkUpClass.active);
			if (!activeDrops.empty()) {
				activeDrops.moveToFront();
			}
			const favoriteDrops = changeDrops.filter('.' + MarkUpClass.favorites);
			if (!favoriteDrops.empty()) {
				favoriteDrops.moveToFront();
				favoriteDrops.style('filter', 'url(#highlight)');
			}
		}
		textContainer.moveToFront();
	}


}
