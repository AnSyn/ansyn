import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { event, mouse, select, selectAll, selection } from 'd3';
import { eventDrops } from 'event-drops';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { isEqual } from 'lodash';

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

	private _drops: any[];
	private _markup: any[];

	@Input() configuration: any;

	@Input() redraw$: BehaviorSubject<number>;

	@Input()
	set markup(value) {
		if (!isEqual(this._markup, value)) {
			this._markup = value;
			this.drawMarkup();
		}
	}

	@HostListener('window:resize')
	onresize() {
		this.redraw$.next(0);
	}

	@Input()
	set drops(drops: any[]) {
		this._drops = drops || [];
		this.eventDropsHandler();
		if (this._drops.length > 0 && this._markup) {
			this.drawMarkup();
		}
		// this.stream.next();

	}

	get drops() {
		return this._drops;
	}

	drawMarkup() {

		selectAll('.drop.displayed').classed('displayed ', false);
		selectAll('.drop.active').classed('active', false);
		selectAll('.drop.favorites').classed('favorites', false).style('filter', 'none');
		selectAll('.drop.hover').classed('hover', false);

		const nodes = [];
		this._markup.forEach(markupItem => {
			const element = document.querySelector(`circle[data-id="${markupItem.id}"]`);
			if (element) {
				element.classList.add(markupItem.class);
				nodes.push(element);
			}
		});
		if (nodes.length > 0) {
			const selection = (<any>selectAll(nodes));
			selection.moveToFront();
		}

		selectAll('.drop.favorites').style('filter', 'url(#highlight)');
	}

	get markup() {
		return this._markup;
	}


	constructor(private emitter: TimelineEmitterService) {
	}

	ngOnInit() {
		this.redraw$.subscribe(value => {
			if (this.drops) {
				this.eventDropsHandler();
				this.drawMarkup();
			}
		});
	}

	clickEvent() {
		const tolerance = 5;
		let down, wait;
		const dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

		return (data, index, nodes) => {
			if (!down) {
				down = mouse(document.body);
				wait = window.setTimeout(((e) => () => {
					wait = null;
					down = null;
					// this.toggleDrop(nodes[index]);
					this.emitter.provide('timeline:click').next({ event: e, element: data, index, nodes });
				})(event), 300);
			} else {
				if (dist(down, mouse(document.body)) < tolerance) {
					this.selectAndShowDrop(nodes[index], event, data, index, nodes);

				}
				if (wait) {
					window.clearTimeout(wait);
					wait = null;
					down = null;
				}
				return;
			}
		};
	}

	selectAndShowDrop(element, event, data, index, nodes) {
		this.emitter.provide('timeline:dblclick').next({ event, element: data, index, nodes });
	}

	toggleDrop(element) {
		// d3.select(element)['moveToFront']();
		// element.classList.toggle('selected');
	}

	eventDropsHandler(): void {

		const chart = eventDrops(this.configuration)
			.mouseout(data => this.emitter.provide('timeline:mouseout').next(data))
			.mouseover(data => this.emitter.provide('timeline:mouseover').next(data))
			.zoomend((result) => this.emitter.provide('timeline:zoomend').next(result))
			.zoomStreamCallback(result => this.emitter.provide('timeline:zoomStream').next(result))
			.eventColor(BASE_DROP_COLOR)
			.click(this.clickEvent())
			.dblclick(() => {
				event.stopPropagation();
			});

		const dataSet = this.drops.map(entities => ({
			name: entities.name || '',
			data: entities.data,
		}));

		const element = select(this.context.nativeElement)
			.datum(dataSet);

		chart(element);

		if (this._markup) {
			this.drawMarkup();
		}

	}
}
