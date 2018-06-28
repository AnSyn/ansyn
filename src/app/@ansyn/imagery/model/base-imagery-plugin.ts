import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable } from 'rxjs';
import { IMap, IMapConstructor } from './imap';
import { of, Subscription } from 'rxjs';
import { ImageryDecorator } from './imagery-decorator';

export class BaseImageryPlugin {
	subscriptions: Subscription[] = [];
	communicator: CommunicatorEntity;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any> = new EventEmitter<any>();

	get iMap(): IMap {
		return this.communicator && this.communicator.ActiveMap;
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
	supported?: IMapConstructor[];
	deps?: any[];
}

export interface BaseImageryPluginConstructor extends ImageryPluginMetaData {
	new(...args): BaseImageryPlugin;
}

export function ImageryPlugin(metaData: ImageryPluginMetaData) {
	return function (constructor: BaseImageryPluginConstructor) {
		ImageryDecorator<ImageryPluginMetaData, BaseImageryPluginConstructor>(metaData)(constructor);
	}
}
