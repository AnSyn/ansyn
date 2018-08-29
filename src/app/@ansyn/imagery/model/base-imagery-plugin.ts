import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable, of } from 'rxjs';
import { BaseImageryMap, IBaseImageryMapConstructor } from './base-imagery-map';

export interface IImageryPluginMetaData {
	supported?: IBaseImageryMapConstructor[];
	deps?: any[];
}

export interface IBaseImageryPluginConstructor extends IImageryPluginMetaData {
	new(...args): BaseImageryPlugin;
}

export class BaseImageryPlugin {

	communicator: CommunicatorEntity;
	isEnabled: boolean;
	onDisposedEvent: EventEmitter<any> = new EventEmitter<any>();

	get iMap(): BaseImageryMap {
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
		this.onDispose();
	}

	init(communicator: CommunicatorEntity) {
		this.communicator = communicator;
		this.onInit();
		this.onInitSubscriptions();
	};

	onInit(): void {

	}

	onInitSubscriptions(): void {

	}

	onDispose(): void {

	}
}
