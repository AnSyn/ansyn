import { ViewEncapsulation, Component, OnInit, ViewChild, ElementRef, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

import { eventDrops } from 'event-drops';

import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import '@ansyn/core/utils/d3extending';

/*d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };*/


@Component({
    selector: 'ansyn-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 *
 */
export class TimelineComponent implements OnInit {

    private _drops: any[];
    private stream: Observable<any>;

    @ViewChild('context') context: ElementRef;


    @Input()
    set drops(drops: any[]) {
        
        this._drops = drops;
        this.eventDropsHandler();
        //this.stream.next();
        
    }
    get drops() {
        return this._drops;
    }


    @Input() configuration: any;

    @Input() redraw$: BehaviorSubject<number>;
      

    constructor(private emitter: TimelineEmitterService) {}

    ngOnInit(){
        const drops$ = Observable.of(this.drops);
        const configuration$ = Observable.of(this.configuration);
        
        this.redraw$.subscribe(value => {
            this.eventDropsHandler();
        })
    }
    
    clickEvent() {
        const tolerance = 5;
        let down, wait;
        const dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

        return (data, index, nodes) => {
            if (!down) {
                down = d3.mouse(document.body);
                wait = window.setTimeout(((e) => () => {
                    wait = null;
                    down = null;
                    this.toggleDrop(nodes[index]);
                    this.emitter.provide('timeline:click').next({ event: e, element: data, index, nodes });
                })(d3.event), 300);
            } else {
                if (dist(down, d3.mouse(document.body)) < tolerance) {
                    this.selectAndShowDrop(nodes[index],d3.event,data,index,nodes);
                    
                }
                if (wait) {
                    window.clearTimeout(wait);
                    wait = null;
                    down = null;
                }
                return;
            }
        }
    }

    selectAndShowDrop(element,event,data,index,nodes) {
        d3.select(element)['moveToFront']();
        element.classList.add('selected');
        this.emitter.provide('timeline:dblclick').next({ event, element: data, index, nodes });
    }

    toggleDrop(element) {
        d3.select(element)['moveToFront']();
        element.classList.toggle('selected');

    }

    eventDropsHandler(): void {
        console.log('draw',this.configuration && this.configuration.start,this.configuration && this.configuration.end,this.drops && this.drops[0] && this.drops[0].data.length);
        const chart = eventDrops(this.configuration)
            .mouseout(data => this.emitter.provide('timeline:mouseout').next(data))
            .mouseover(data => this.emitter.provide('timeline:mouseover').next(data))
            .zoomend((a, b, c) => this.emitter.provide('timeline:zoomend').next({ a, b, c }))
            .click(this.clickEvent())
            .dblclick(() => {
                d3.event.stopPropagation()
            })

        const dataSet = this.drops.map(entities => ({
            name: entities.name || "",
            data: entities.data,
        }));

        const element = d3.select(this.context.nativeElement)
            .datum(dataSet);

        chart(element);
    }
}
