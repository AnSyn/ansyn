import { Injectable } from '@angular/core';
import {Subject,Subscription} from 'rxjs/Rx';
/**
 * to use this service in another service/component
 * import {Subscription} from 'rxjs/Rx';
 *
 * 	class UseTimelineEventEmitter{
 *  	private subscriptions: Subscription[] = [];
 		constructor(){
 			this.subscriptions = [
				emitter.provide('timeline:click').subscribe(
					(e) => {
						console.log('click',e);
					}),

		 		emitter.provide('timeline:zoomend').subscribe(
					(e) => {
						console.log('zoomend',e);
					})
			];
		}

		ngOnDestroy(): void {
			this.subscriptions.forEach(item => {
       			item.unsubscribe();
       		})
       	}
 	}

 	}
 *
 */

@Injectable()
export class TimelineEmitterService {
		private  _emitters: { [channel: string]: Subject<any> } = {};

	  	constructor() {
	  		this.create('timeline:click');
	  		this.create('timeline:dblclick');
	  		this.create('timeline:mouseover');
	  		this.create('timeline:mouseout');
	  		this.create('timeline:zoomend');
	  		this.create('timeline:zoomStream');
	  	}

		private create(name:string) {
			this._emitters[name] = new Subject();
		}

		public provide(name: string) {
			if (!this._emitters[name]) {

           		throw new Error(name + ' emitter does not exist ' );
           	}
       		return this._emitters[name];
		}

		public subscribe(name,onNext,onError?,onDone?) {
       		return this.provide(name).subscribe(onNext,onError,onDone);
       	}

}
