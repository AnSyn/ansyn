import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: CommunicatorEntity };
	public communicatorsChange = new EventEmitter();

	constructor() {
		this._communicators = {};
	}

	public provideCommunicator(id: string): CommunicatorEntity {
		if (!this._communicators[id]) {
			this.createImageryCommunicator(id);
		}
		return this._communicators[id];
	}

	get communicators(): any {
		return this._communicators;
	}

	private createImageryCommunicator(id: string): void {
		this._communicators[id] = new CommunicatorEntity(id);
		this.communicatorsChange.emit(this._communicators);
	}

	public removeCommunicator(id: string) {
		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
		this.communicatorsChange.emit(this._communicators);
	}
}
