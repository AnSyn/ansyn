import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';

export abstract class BaseImageryPlugin {
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any>;
	abstract init(communicator: CommunicatorEntity);
	abstract dispose();
}
