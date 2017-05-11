import { ViewEncapsulation,Component, OnInit,ViewChild,ElementRef,Input,OnChanges,ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';

import  { eventDrops }   from 'event-drops';

import { TimelineEmitterService } from '../services/timeline-emitter.service';

import  '@ansyn/core/utils/d3extending';

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
export class TimelineComponent {

	private _drops: any[];

	@ViewChild('context') context: ElementRef;


	@Input()
		set drops(drops:any[]) {
			this._drops = drops;
        	if(this._drops.length){
                this.eventDropsHandler();
            }
		}
		get drops() {
       		return this._drops;
       	}


	@Input() configuration:any;

	constructor(private emitter : TimelineEmitterService) {
	}


	clickEvent() {
	    const tolerance = 5;
        let down,wait;
        const dist = (a,b) => Math.sqrt(Math.pow(a[0] - b[0],2) + Math.pow(a[1] - b[1],2));

        return (element,index,nodes) => {
            if(!down){
                down = d3.mouse(document.body);
                wait = window.setTimeout( ((e) => () => {
                    wait = null;
                    down = null;
                    nodes[index].classList.toggle('selected');
                    d3.select(nodes[index])['moveToFront']();
                    this.emitter.provide('timeline:click').next({event:e,element,index,nodes});
                })(d3.event),300);
            }
            else{
                if(dist(down,d3.mouse(document.body)) < tolerance){
                    d3.select(nodes[index])['moveToFront']();
                    nodes[index].classList.add('selected');
                    this.emitter.provide('timeline:dblclick').next({event:d3.event,element,index,nodes});
                }
                if(wait){
                    window.clearTimeout(wait);
                    wait = null;
                    down = null;
                }
                return;
            }
        }
    }

	eventDropsHandler() :void {
		const chart = eventDrops(this.configuration)
			.mouseout( data => 	this.emitter.provide('timeline:mouseout').next(data))
    		.mouseover( data => this.emitter.provide('timeline:mouseover').next(data))
    		.zoomend((a,b,c) => this.emitter.provide('timeline:zoomend').next({a,b,c}))
    		.click(this.clickEvent())
    		.dblclick( () => {
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
