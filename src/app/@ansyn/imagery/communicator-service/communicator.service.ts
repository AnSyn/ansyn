import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';
import { ImageryComponentManager } from '../imagery-component/manager/imagery.component.manager';

export interface ImageryChanged {
	id: string;
}

@Injectable()
export class ImageryCommunicatorService {

	public communicators: { [id: string]: CommunicatorEntity } = {};
	public instanceCreated = new EventEmitter<ImageryChanged>();
	public instanceRemoved = new EventEmitter<ImageryChanged>();

	public provide(id: string): CommunicatorEntity {

		if (!this.communicators[id]) {
			return null;
		}
		return this.communicators[id];
	}

	communicatorsAsArray(): CommunicatorEntity[] {
		return Object.values(this.communicators) as CommunicatorEntity[];
	}

	public createCommunicator(componentManager: ImageryComponentManager): void {
		if (this.communicators[componentManager.id]) {
			throw new Error(`'Can't create communicator ${componentManager.id}, already exists!'`);
		}

		this.communicators[componentManager.id] = new CommunicatorEntity(componentManager);
		this.instanceCreated.emit({ id: componentManager.id });
	}

	public remove(id: string) {
		if (!this.communicators[id]) {
			return;
		}
		this.communicators[id].dispose();
		this.communicators[id] = null;
		delete (this.communicators[id]);
		this.instanceRemoved.emit({ id });
	}
}
