import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Observable } from 'rxjs/Observable';
import { SelectOverlayAction,UnSelectOverlayAction } from '../actions/timeline.actions';
import { DestroySubscribers } from "ng2-destroy-subscribers";
import * as _ from 'lodash';

import * as turf from "@turf/turf";

import 'rxjs/add/operator/filter';
import '@ansyn/core/utils/debug';
import '@ansyn/core/utils/compare';

import { Store } from '@ngrx/store';
import * as overlay from '../actions/timeline.actions';
import { IOverlayState } from '../reducers/timeline.reducer';

import * as d3 from 'd3';

@Component({
	selector: 'timeline-container',
  	templateUrl: './container.component.html',
  	styleUrls: ['./container.component.css']
})

@DestroySubscribers({ 
	destroyFunc: 'ngOnDestroy',
})
export class OverlayContainerComponent implements OnInit,AfterViewInit  {
	public drops: any[] = [];
	public configuration: any;
	private errorMessage: string;
	//public demoCount:Observable<number>;

	public overlays : any;	
	public selectedOverlays: Array<string> = [];
	public subscribers: any = {};


	constructor(private store: Store <IOverlayState>,private timelineService: TimelineService,private emitter : TimelineEmitterService) {
		this.configuration = {    
		  	start: new Date(new Date().getTime() - 3600000 * 24 * 365),
        	end: new Date(),
        	eventLineColor: (d,i) => d3.schemeCategory10[i],
        	date: d => new Date(d.date)
        };
        console.log(turf);
        
    }
	ngOnInit(): void {
		this.init();
	}

	ngAfterViewInit(): void { 
		this.subscribers.clickEmitter = this.emitter.provide('timeline:click')
			.subscribe(data => this.toggleOverlay(data.id));	
	}

	//maybe to move this to the service
	toggleOverlay(id): void {
		if(this.selectedOverlays.indexOf(id) > -1){
			this.store.dispatch(new UnSelectOverlayAction(id));
		}else{
			this.store.dispatch(new SelectOverlayAction(id));
		}
	}
	
	demo(): void {
		this.store.dispatch( new overlay.DemoAction('tmp'))
	}
	
	init(): void {     
		this.subscribers.overlays = this.store.select('overlays')
			//look for better solution for this problem
			.skip(1)
			.distinctUntilChanged(this.timelineService.compareOverlays)
    		.map((data: any) =>   this.timelineService.parseOverlayDataForDispaly(data.overlays, data.filters))
			.subscribe(overlays => this.drops = overlays);

		this.subscribers.selected = this.store.select('overlays')
			.skip(1)
			.distinctUntilChanged((data: IOverlayState, data1:IOverlayState) =>  _.isEqual(data.selectedOverlays,data1.selectedOverlays))
			.map( (data:IOverlayState) => data.selectedOverlays)
			.subscribe(selectedOverlays => 	this.selectedOverlays = selectedOverlays)
		
		this.store.dispatch(new overlay.LoadOverlaysAction());
   	}

}
