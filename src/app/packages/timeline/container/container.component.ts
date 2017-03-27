import { Component, OnInit,OnDestroy } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import {Subscription} from 'rxjs/Rx';
import * as d3 from 'd3';

@Component({
	selector: 'timeline-container',
  	templateUrl: './container.component.html',
  	styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit , OnDestroy {
	public drops: any[] = [];
	public configuration: any;
	private errorMessage: string;
	private subscriptions: Subscription[] = [];

	constructor(private timelineService: TimelineService,private emitter : TimelineEmitterService) {
		this.configuration = {    
		  	start: new Date(new Date().getTime() - 3600000 * 24 * 365),
        	end: new Date(),
        	eventLineColor: (d,i) => d3.schemeCategory10[i],
        	date: d => new Date(d.date)
        };
        //this.subscriptions = [];
		
		/*this.subscriptions = [
			emitter.provide('timeline:click').subscribe(
				(e) => { 
					console.log('click',e);	
				}),

	 		emitter.provide('timeline:zoomend').subscribe(
				(e) => { 
					console.log('zoomend',e);	
				})	              
		];*/          
  	}

	ngOnInit(): void {
		this.timelineService.fetchData()
			.subscribe(
				data => this.drops = data,
				error => this.errorMessage = <any>error
			);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(item => {     
       		item.unsubscribe();                                
       	})
 	}	
}
