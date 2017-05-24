import { EventEmitter, Injectable, InjectionToken } from '@angular/core';
import { IImageryCommunicator, ImageryCommunicator } from './imageryCommunicator';
import { IImageryConfig } from '../model/model';

export const ImageryConfig: InjectionToken<IImageryConfig> = new InjectionToken('imagery-config');

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: ImageryCommunicator };
	public communicatorsChange = new EventEmitter();

	constructor() {
		this._communicators = {};
	}

	public provideCommunicator(id: string): IImageryCommunicator {
		if (!this._communicators[id]) {
			this.createImageryCommunicator(id);
		}
		return this._communicators[id];
	}
	
	get communicators(): any {
		return this._communicators;
	}
	
	private createImageryCommunicator(id: string): void {
		this._communicators[id] = new ImageryCommunicator(id);
		this.communicatorsChange.emit(this._communicators);
	}

	public removeCommunicator(id: string) {
		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
		this.communicatorsChange.emit(this._communicators);
	}
}
