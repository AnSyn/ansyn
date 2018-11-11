import { ComponentFactoryResolver, Directive, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { IAlertComponent } from '../alerts/alerts.model';
import { IOverlay } from '../models/overlay.model';


export interface IAlertComponentSettings {
	component: any
	mapId: string;
	overlay: IOverlay;
}

@Directive({
	selector: '[ansynAlertComponent]'
})
export class AlertComponentDirective implements OnDestroy {
	componentRef;

	@Input('ansynAlertComponent')
	set ansynAlertComponent({ component, mapId, overlay }: IAlertComponentSettings) {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
		const factory = this.componentFactoryResolver.resolveComponentFactory<IAlertComponent>(component);
		this.componentRef = this.viewContainerRef.createComponent<IAlertComponent>(factory);
		this.componentRef.instance.mapId = mapId;
		this.componentRef.instance.overlay = overlay;

	};

	constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
