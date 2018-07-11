import { EventEmitter } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { Observable } from 'rxjs';
import { BaseImageryMap, BaseImageryMapConstructor } from './base-imagery-map';
import { of, Subscription } from 'rxjs';

export interface ImageryPluginMetaData {
	supported?: BaseImageryMapConstructor[];
	deps?: any[];
}

export interface BaseImageryPluginConstructor extends ImageryPluginMetaData {
	new(...args): BaseImageryPlugin;
}

export class BaseImageryPlugin {
	/* prototype */ readonly subscriptionKeys;
	subscriptions: Subscription[] = [];

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
		this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
		this.subscriptions = [];
		this.onDispose()
	}

	init(communicator: CommunicatorEntity) {
		this.communicator = communicator;
		this.onInit();
		if (this.subscriptionKeys) {
			this.subscriptions.push(
				...this.subscriptionKeys
					.map((key) => this[key])
					.filter(Boolean)
					.map((value) => typeof value === 'function' ? value() : value)
					.filter((observable: Observable<any>) => observable instanceof Observable)
					.map((observable): Subscription => observable.subscribe())
			)
		}
		this.onInitSubscriptions();
	};

	onInit(): void {

	}

	onInitSubscriptions() {

	}

	onDispose() {

	}
}

export function ImageryPluginSubscription(target: Object | any, propertyKey: string | symbol) {
	if (!target.subscriptionKeys) {
		target.subscriptionKeys = []
	}
	target.subscriptionKeys.push(propertyKey);
}
