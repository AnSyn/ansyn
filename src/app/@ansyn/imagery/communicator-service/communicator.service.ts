import { Injectable } from '@angular/core';
import { CommunicatorEntity } from './communicator.entity';
import { Store } from '@ngrx/store';
import { ImageryState } from '../reducers/imagery.reducers';
import { CreateImagery, RemoveImagery } from '../actions/imagery.actions';

export interface ICommunicators {
	[id: string]: CommunicatorEntity | any;
}

@Injectable({
	providedIn: 'root'
})
export class ImageryCommunicatorService {

	public communicators: ICommunicators = {};

	constructor(protected store$: Store<ImageryState>) {
	}

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
			throw new Error(`'Can't create communicator ${communicatorEntity.id}, already exists!'`);
		}

		this.communicators[communicatorEntity.id] = communicatorEntity;
		this.store$.dispatch(new CreateImagery({ settings: communicatorEntity.mapSettings }));
	}

	public remove(id: string) {
		if (!this.communicators[id]) {
			return;
		}
		this.communicators[id].dispose();
		this.communicators[id] = null;
		delete (this.communicators[id]);
		this.store$.dispatch(new RemoveImagery({ id }));
	}
}
