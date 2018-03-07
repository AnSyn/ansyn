import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class TimelineEmitterService {
	private _emitters: { [channel: string]: Subject<any> } = {};

	constructor() {
		this.create('timeline:click');
		this.create('timeline:dblclick');
		this.create('timeline:mouseover');
		this.create('timeline:mouseout');
		this.create('timeline:zoomend');
		this.create('timeline:zoomStream');
	}

	private create(name: string) {
		this._emitters[name] = new Subject();
	}

	public provide(name: string) {
		if (!this._emitters[name]) {

			throw new Error(name + ' emitter does not exist ');
		}
		return this._emitters[name];
	}

	public subscribe(name, onNext, onError?, onDone?): Subscription {
		return this.provide(name).subscribe(onNext, onError, onDone);
	}

}
