import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

export class BaseImageryPlugin {
	static supported = [];
	subscriptions: Subscription[] = [];
	communicator: CommunicatorEntity;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any> = new EventEmitter<any>();

	onResetView(): Observable<boolean> {
		return Observable.of(true);
	};

	dispose() {
		this.onDisposedEvent.emit();
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}

	init(communicator: CommunicatorEntity) {
		this.communicator = communicator;
	};

}
