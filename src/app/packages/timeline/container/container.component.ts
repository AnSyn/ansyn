import { Component, OnInit } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/filter';

import { Store } from '@ngrx/store';
import * as overlay from '../actions/timeline.actions';
import * as reducer from '../reducers/timeline.reducer';

import * as d3 from 'd3';

@Component({
	selector: 'timeline-container',
  	templateUrl: './container.component.html',
  	styleUrls: ['./container.component.css']
})


export class ContainerComponent implements OnInit  {
	public drops: any[] = [];
	public configuration: any;
	private errorMessage: string;
	//public demoCount:Observable<number>;
	public overlays : any;	

	constructor(private store: Store <reducer.IOverlayState>,private timelineService: TimelineService,private emitter : TimelineEmitterService) {
		this.configuration = {    
		  	start: new Date(new Date().getTime() - 3600000 * 24 * 365),
        	end: new Date(),
        	eventLineColor: (d,i) => d3.schemeCategory10[i],
        	date: d => new Date(d.date)
        };
        
    }
	ngOnInit(): void {
		/*this.timelineService.fetchData()
			.subscribe(
				data => this.drops = data,
				error => this.errorMessage = <any>error
			);*/
			this.demo();
	}

	demo(): void {     
		this.store.select('overlays')
			.map((data: any) => {
				return this.timelineService.parseOverlayDataForDispaly(data.overlays, data.filters);
			})
			//.map( (data:reducer.State) => data.ews )
			.subscribe(overlays => {
				this.drops = overlays;
			});
   		this.store.dispatch( new overlay.LoadOverlaysAction());
   	}
}
