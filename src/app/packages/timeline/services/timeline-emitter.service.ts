import { Injectable } from '@angular/core';
import {Subject,Subscription} from 'rxjs/Rx';

@Injectable()
export class TimelineEmitterService {
		private  _emitters: { [channel: string]: Subject<any> } = {};	
	  	
	  	constructor() { 
	  		this.create('timeline:click');
	  		this.create('timeline:mouseover');
	  		this.create('timeline:mouseout');
	  		this.create('timeline:zoomend');
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
