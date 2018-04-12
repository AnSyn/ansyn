import {
	ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit,
	ViewChild
} from '@angular/core';
import { schemeCategory10, selection } from 'd3';
import * as d3 from 'd3/build/d3';
import eventDrops from './src/index';

import { OverlaysService, TimelineEmitterService } from '../../services';
import { OverlayDrop, OverlayLine } from '@ansyn/overlays/reducers';
import { TimelineRange } from '@ansyn/overlays/reducers/overlays.reducer';
import { EventDropConfiguration } from '@ansyn/overlays/components/timeline/src/config';
import { MarkUpClass, MarkUpData, MarkUpTypes } from '@ansyn/overlays';
import { ExtendMap } from '@ansyn/overlays/reducers/extendedMap.class';
import { select, selectAll } from 'd3-selection';

export const BASE_DROP_COLOR = '#d393e1';
selection.prototype.moveToFront = function () {
	return this.each(function () {
		this.parentNode.appendChild(this);
	});
};


@Component({
	selector: 'ansyn-timeline',
	templateUrl: './timeline.component.html',
	styleUrls: ['./timeline.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})


export class TimelineComponent implements OnInit {

	@ViewChild('context') context: ElementRef;
	configuration: EventDropConfiguration = this.setConfiguration();
	private chart: any;

	@Input() redraw$: EventEmitter<any>;

	private element: any;
	private dblClick: number;

	private _timeLineRange: TimelineRange;
	@Input('timeLineRange')
	set timeLineRange(value: TimelineRange) {
		if (value) {
			this._timeLineRange = value;
			this.configuration.range = value;
		}
	}

	get timeLineRange() {
		return this._timeLineRange;
	}

	private _markup: ExtendMap<MarkUpClass, MarkUpData>;
	@Input('markup')
	set markup(value: ExtendMap<MarkUpClass, MarkUpData>) {
		const newActive = value.get(MarkUpClass.active).overlaysIds;
		if (newActive && newActive.length) {
			const oldActive = this._markup.get(MarkUpClass.active).overlaysIds;
			if (!oldActive || (oldActive.length && oldActive[0] !== newActive[0])) {
				this.checkDiffranceInTimeRange(this.dropsIdMap.get(newActive[0]));
			}
		}
		this._markup = value;
		this.drawMarkup();
	}

	get markup() {
		return this._markup;
	}

	dropsIdMap: Map<string, OverlayDrop> = new Map();
	private _drops: Array<OverlayLine> = [];
	@Input()
	set drops(drops: Array<OverlayLine>) {
		if (drops && drops.length) {
			this._drops = drops.map(entities => ({
				name: entities.name || '',
				data: entities.data
			}));
			if (this._drops[0] && this._drops[0].data && this._drops[0].data.length) {
				this._drops[0].data.forEach(drop => {
					this.dropsIdMap.set(drop.id, drop);
				});
				this.timeLineRange = this.overlaysService.getTimeRangeFromDrops(this._drops[0].data);
				this.initEventDropsSequence();
			}
		}
	}

	get drops() {
		return this._drops;
	}

	@HostListener('window:resize')
	onresize() {
		this.initEventDropsSequence();
	}

	constructor(@Inject(TimelineEmitterService) protected emitter: TimelineEmitterService, @Inject(OverlaysService) protected overlaysService: OverlaysService) {

	}

	ngOnInit() {
		this.redraw$.subscribe(() => {
			this.initEventDropsSequence();
		});
	}

	setConfiguration(): EventDropConfiguration {
		return {
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
				onClick: (this.onClick.bind(this)),
				onDblClick: (this.onDblClick.bind(this)),
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
	}

	onMouseOver(d) {
		this.emitter.provide('timeline:mouseover').next(d);
	}

	onMouseOut(d) {
		this.emitter.provide('timeline:mouseout').next(d);
	}

	onDblClick(d) {
		this.dblClick = Date.now();
		event.stopPropagation();
		this.emitter.provide('timeline:dblclick').next(d);
	}

	onClick(d) {
		const timeMargin = 500;
		const firstClick = Date.now();
		window.setTimeout((() => {
			if (this.dblClick && this.dblClick - firstClick < timeMargin) {
				this.dblClick = null;
				return;
			}
			this.dblClick = null;
			this.emitter.provide('timeline:click').next(d);
		}).bind(this), timeMargin);
	}

	onZoomEnd() {
		this.setTimeLineRangeFromDrops();
		this.emitter.provide('timeline:zoomend')
			.next(this.timeLineRange);
	}

	initEventDropsSequence() {
		if (this.drops && this.drops.length) {
			this.removeOldEventDrops();
			this.initEventDrop();
			this.setTimeLineRangeFromDrops();
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

	checkDiffranceInTimeRange(activeMarkup) {
		const timeLineRange = this.overlaysService.getTimeStateByOverlay(activeMarkup, this.timeLineRange);
		if (timeLineRange.start.getTime() !== this.timeLineRange.start.getTime() ||
			timeLineRange.end.getTime() !== this.timeLineRange.end.getTime()
		) {
			this.timeLineRange = timeLineRange;
			this.initEventDropsSequence();
		}
	}

	setTimeLineRangeFromDrops() {
		this.timeLineRange = {
			start: this.chart.scale().domain()[0],
			end: this.chart.scale().domain()[1]
		};
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
