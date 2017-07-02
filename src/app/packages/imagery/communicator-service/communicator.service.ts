import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';
import { values } from 'lodash';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

@Injectable()
export class ImageryCommunicatorService {

	private  _communicators: { [id: string]: CommunicatorEntity };
	public instanceCreated = new EventEmitter();
	public instanceRemoved = new EventEmitter();


	public initiliziedCommunicators:Array<string> = [];

	constructor() {
		this._communicators = {};
	}

	public provide(id: string): CommunicatorEntity {

		if (!this._communicators[id]) {
			return null;
		}
		return this._communicators[id];
	}

	get communicators(): any {
		return this._communicators;
	}

	communicatorsAsArray():Array<CommunicatorEntity>{
		return values(this._communicators);
	}

	public createCommunicator(componentManager: ImageryComponentManager): void {
		if (this._communicators[componentManager.Id]) {
			throw new Error(`'Can't create communicator ${componentManager.Id}, already exists!'`);
		}

		this._communicators[componentManager.Id] = new CommunicatorEntity(componentManager);
		this.initiliziedCommunicators.push(componentManager.Id);
		this.instanceCreated.emit({
			communicatorsIds: this.initiliziedCommunicators,
			currentCommunicatorId: componentManager.Id
		});
	}

	public replaceCommunicatorId(old_id, new_id) {
		this.communicators[new_id] = this.communicators[old_id];
		this.communicators[new_id].id = new_id;
		delete this.communicators[old_id];

		this.initiliziedCommunicators.splice(this.initiliziedCommunicators.indexOf(old_id),1);
		this.initiliziedCommunicators.push(new_id);
	}

	public remove(id: string) {
		if(!this._communicators[id]) {
			return;
		}

		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
		this.initiliziedCommunicators.splice(this.initiliziedCommunicators.indexOf(id),1);
		this.instanceRemoved.emit({
			communicatorsIds: this.initiliziedCommunicators,
			currentCommunicatorId: id
		});
	}
}
