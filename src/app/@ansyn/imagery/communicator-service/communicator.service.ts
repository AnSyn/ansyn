import { EventEmitter, Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';

export interface ICommunicators {
	[id: string]: CommunicatorEntity;
}

@Injectable()
export class ImageryCommunicatorService {

	public communicators: ICommunicators = {};
	public instanceCreated = new EventEmitter<{ id: string }>();
	public instanceRemoved = new EventEmitter<{ id: string }>();

	public provide(id: string): CommunicatorEntity {

		if (!this.communicators[id]) {
			return null;
		}
		return this.communicators[id];
	}

	communicatorsAsArray(): CommunicatorEntity[] {
		return Object.values(this.communicators) as CommunicatorEntity[];
	}

	public createCommunicator(communicatorEntity: CommunicatorEntity): void {
		if (this.communicators[communicatorEntity.id]) {
			throw new Error(`'Can't create communicator ${ communicatorEntity.id }, already exists!'`);
		}

		this.communicators[communicatorEntity.id] = communicatorEntity;
		this.instanceCreated.emit({ id: communicatorEntity.id });
	}

	public remove(id: string) {
		if (!this.communicators[id]) {
			return;
		}
		this.communicators[id] = null;
		delete (this.communicators[id]);
		this.instanceRemoved.emit({ id });
	}
}
