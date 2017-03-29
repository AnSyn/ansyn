import { Component, OnInit } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';

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
	

	constructor(private timelineService: TimelineService,private emitter : TimelineEmitterService) {
		this.configuration = {    
		  	start: new Date(new Date().getTime() - 3600000 * 24 * 365),
        	end: new Date(),
        	eventLineColor: (d,i) => d3.schemeCategory10[i],
        	date: d => new Date(d.date)
        };
    }

	ngOnInit(): void {
		this.timelineService.fetchData()
			.subscribe(
				data => this.drops = data,
				error => this.errorMessage = <any>error
			);
	}
}
