import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { SelectOverlayAction,UnSelectOverlayAction } from '../actions/overlays.actions';
import { DestroySubscribers } from "ng2-destroy-subscribers";

import * as _ from 'lodash';
import 'rxjs/add/operator/filter';
import '@ansyn/core/utils/debug';
import '@ansyn/core/utils/compare';

import { Store } from '@ngrx/store';
import * as overlaysAction from '../actions/overlays.actions';
import { IOverlayState } from '../reducers/overlays.reducer';

import * as d3 from 'd3';
import { OverlaysService } from "../services/overlays.service";

@Component({
	selector: 'overlays-container',
  	templateUrl: './overlaysContainer.component.html',
  	styleUrls: ['./overlaysContainer.component.css']
})

@DestroySubscribers({
	destroyFunc: 'ngOnDestroy',
})
export class OverlaysContainer implements OnInit,AfterViewInit  {
	public drops: any[] = [];
	public configuration: any;
	
	private errorMessage: string;
	
	public overlays : any;
	public selectedOverlays: Array<string> = [];
	public subscribers: any = {};


	constructor(private store: Store <IOverlayState>,private overlaysService: OverlaysService,private emitter : TimelineEmitterService) {
		this.configuration = {
		  	start: new Date(new Date().getTime() - 3600000 * 24 * 365),
		  	margin:{
		  		top: 60,
	            left: 50,
	            bottom: 40,
	            right: 50,
		  	},
        	end: new Date(),
        	eventLineColor: (d,i) => d3.schemeCategory10[i],
        	date: d => new Date(d.date),
        	displayLabels: false

        };
    }

	ngOnInit(): void {

		this.init();
	}

	ngAfterViewInit(): void {
		this.subscribers.clickEmitter = this.emitter.provide('timeline:click')
			.subscribe(data => this.toggleOverlay(data.element.id));
		this.subscribers.clickEmitter = this.emitter.provide('timeline:dblclick')
			.subscribe(data => this.store.dispatch(new overlaysAction.DisplayOverlayAction(data.element.id)));	
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
		this.store.dispatch( new overlaysAction.DemoAction('tmp'))
	}

	init(): void {
		this.subscribers.overlays = this.store.select('overlays')
			.skip(1)
			.distinctUntilChanged(this.overlaysService.compareOverlays)
    		.map((data: any) =>   this.overlaysService.parseOverlayDataForDispaly(data.overlays, data.filters))
			.subscribe(overlays => this.drops = overlays);

		this.subscribers.selected = this.store.select('overlays')
			.skip(1)
			.distinctUntilChanged((data: IOverlayState, data1:IOverlayState) =>  _.isEqual(data.selectedOverlays,data1.selectedOverlays))
			.map( (data:IOverlayState) => data.selectedOverlays)
			.subscribe(selectedOverlays => 	this.selectedOverlays = selectedOverlays)

		this.store.dispatch(new overlaysAction.LoadOverlaysAction());
   	}

}
