import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable, of } from 'rxjs';
import { BaseImageryMap, IBaseImageryMapConstructor } from './base-imagery-map';

export interface IImageryPluginMetaData {
	readonly supported?: IBaseImageryMapConstructor[];
	readonly deps?: any[];
}

export type IBaseImageryPluginConstructor = new(...args) => BaseImageryPlugin;

export class BaseImageryPlugin implements IImageryPluginMetaData {
	readonly supported?: IBaseImageryMapConstructor[];
	readonly deps?: any[];

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
