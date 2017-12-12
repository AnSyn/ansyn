import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';
import { values } from 'lodash';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

@Injectable()
export class ImageryCommunicatorService {

	private _communicators: { [id: string]: CommunicatorEntity };
	public instanceCreated = new EventEmitter();
	public instanceRemoved = new EventEmitter();


	public initializedCommunicators: Array<string> = [];

	constructor() {
		this._communicators = {};
	}

	public provide(id: string): CommunicatorEntity {

		if (!this._communicators[id]) {
			return null;
		}
		return this._communicators[id];
	}

	get communicators(): { [id: string]: CommunicatorEntity } {
		return this._communicators;
	}

	communicatorsAsArray(): CommunicatorEntity[] {
		return values(this._communicators) as CommunicatorEntity[];
	}

	public createCommunicator(componentManager: ImageryComponentManager): void {
		if (this._communicators[componentManager.id]) {
			throw new Error(`'Can't create communicator ${componentManager.id}, already exists!'`);
		}

		this._communicators[componentManager.id] = new CommunicatorEntity(componentManager);
		this.initializedCommunicators.push(componentManager.id);
		this.instanceCreated.emit({
			communicatorIds: this.initializedCommunicators,
			currentCommunicatorId: componentManager.id
		});
	}

	public replaceCommunicatorId(oldId, newId) {
		this.communicators[newId] = this.communicators[oldId];
		this.communicators[newId]._manager.id = newId;
		delete this.communicators[oldId];
		this.instanceRemoved.emit({
			communicatorIds: this.initializedCommunicators,
			currentCommunicatorId: oldId
		});

		this.initializedCommunicators.splice(this.initializedCommunicators.indexOf(oldId), 1);
		this.initializedCommunicators.push(newId);
		this.instanceCreated.emit({
			communicatorIds: this.initializedCommunicators,
			currentCommunicatorId: newId
		});
	}

	public remove(id: string) {
		if (!this._communicators[id]) {
			return;
		}

		this._communicators[id].dispose();
		this._communicators[id] = null;
		delete (this._communicators[id]);
		this.initializedCommunicators.splice(this.initializedCommunicators.indexOf(id), 1);
		this.instanceRemoved.emit({
			communicatorIds: this.initializedCommunicators,
			currentCommunicatorId: id
		});
	}
}
