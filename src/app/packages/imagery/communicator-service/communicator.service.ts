import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: CommunicatorEntity };
	public communicatorsChange = new EventEmitter();
	public initiliziedCommunicators:Array<string> = [];

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
		this._communicators[id]['isReady'].subscribe((success:string) => {
			if(success){
				this.initiliziedCommunicators.push(id);
				this.communicatorsChange.emit(this.initiliziedCommunicators);
			}
		});
	}

	public removeCommunicator(id: string) {
		if(!this._communicators[id]) return;
		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
		this.initiliziedCommunicators.splice(this.initiliziedCommunicators.indexOf(id),1);
		this.communicatorsChange.emit(this.initiliziedCommunicators);
	}
}
