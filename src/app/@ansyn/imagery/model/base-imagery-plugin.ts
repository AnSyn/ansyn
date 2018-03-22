import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable } from 'rxjs/Observable';

export abstract class BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any>;
	abstract onResetView(): Observable<boolean>;
	abstract dispose();
	init(communicator: CommunicatorEntity) {
		this.communicator = communicator;
	};

}
