import { Component, OnInit,ViewChild,ElementRef,Input,OnChanges } from '@angular/core';
import * as d3 from 'd3';
import * as eventDrops from 'event-drops';
import { TimelineEmitterService } from '../services/timeline-emitter.service';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
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

    	const dataSet = this._drops.map(repository => ({
        		name: repository.name,
        		data: repository.commits,
    		}));	
		
		const element = d3.select(this.context.nativeElement)
			.datum(dataSet);
		
    	chart(element);	
    }
}
