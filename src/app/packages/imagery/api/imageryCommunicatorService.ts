/**
 * Created by AsafMasa on 27/04/2017.
 */
import { Injectable } from '@angular/core';
import { ImageryCommunicator } from './imageryCommunicator';

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: ImageryCommunicator };

	constructor() {
		this._communicators = {};
	}

	public getImageryCommunicator(id: string): ImageryCommunicator {
		if (!this._communicators[id]) {
			this.createImageryCommunicator(id);
		}
		return this._communicators[id];
	}

	private createImageryCommunicator(id: string): void {
		console.log(`'createImageryAPI ${id}'`);
		this._communicators[id] = new ImageryCommunicator();
	}

	public removeImageryCommunicator(id: string) {
		console.log(`'removeImageryAPI ${id}'`);
		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
	}
}
