import { Component, OnInit,ViewChild,ElementRef,Input,OnChanges,ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';
import { eventDrops } from 'event-drops';
import { TimelineEmitterService } from '../services/timeline-emitter.service';

@Component({
  	selector: 'timeline',
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
        	this.eventDropsHandler();
		}
		get drops() {     
       		return this._drops;
       	}
	
	@Input() configuration:any;
	
	constructor(private emitter : TimelineEmitterService) { 
	}
	
	eventDropsHandler() :void {     
		const chart = eventDrops(this.configuration)
			.mouseout( data => 	this.emitter.provide('timeline:mouseout').next(data))
    		.mouseover( data => this.emitter.provide('timeline:mouseover').next(data))
    		.zoomend((a,b,c) => this.emitter.provide('timeline:zoomend').next({a,b,c}))
    		.click(data => 	this.emitter.provide('timeline:click').next(data));
    	
    	const dataSet = this.drops.map(entities => ({
        		name: entities.name,
        		data: entities.data,
    		}));	
		
		const element = d3.select(this.context.nativeElement)
			.datum(dataSet);
		
    	chart(element);	
    }
}
