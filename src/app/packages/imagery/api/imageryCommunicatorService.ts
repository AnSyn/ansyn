/**
 * Created by AsafMasa on 27/04/2017.
 */
import { Injectable } from '@angular/core';
import {IImageryCommunicator, ImageryCommunicator} from './imageryCommunicator';

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: ImageryCommunicator };

	constructor() {
		this._communicators = {};
	}

	public provideCommunicator(id: string): IImageryCommunicator {
		if (!this._communicators[id]) {
			this.createImageryCommunicator(id);
		}
		return this._communicators[id];
	}

	private createImageryCommunicator(id: string): void {
		console.log(`'createImageryCommunicator ${id}'`);
		this._communicators[id] = new ImageryCommunicator();
	}

	public removeCommunicator(id: string) {
		console.log(`'removeImageryAPI ${id}'`);
		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
	}
}
