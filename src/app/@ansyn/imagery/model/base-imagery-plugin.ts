import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { IMap } from '@ansyn/imagery/model/imap';
import { of } from 'rxjs';

export class BaseImageryPlugin {
	subscriptions: Subscription[] = [];
	communicator: CommunicatorEntity;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any> = new EventEmitter<any>();

	get iMap(): IMap {
		return this.communicator.ActiveMap;
	}

	get mapId(): string {
		return this.communicator && this.communicator.id;
	}

	onResetView(): Observable<boolean> {
		return of(true);
	};

	dispose() {
		this.onDisposedEvent.emit();
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
		this.onDispose()
	}

	init(communicator: CommunicatorEntity) {
		this.communicator = communicator;
		this.onInit();
	};

	onInit(): void {

	}

	onDispose() {

	}
}

export interface ImageryPluginMetaData {
	supported?: { new(...args): IMap }[];
	deps?: any[];
}

export interface BaseImageryPluginClass extends ImageryPluginMetaData {
	new(...args): BaseImageryPlugin;
}

export function ImageryPlugin(metaData: ImageryPluginMetaData) {
	return function (constructor: BaseImageryPluginClass) {
		Object.keys(metaData).forEach((key) => {
			constructor[key] = metaData[key];
		});
	}
}
