import { ComponentFactoryResolver, Directive, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { IAlertComponent } from '@ansyn/core/alerts/alerts.model';


export interface IAlertComponentSettings {
	component: any
	mapId: string;
}

@Directive({
	selector: '[ansynAlertComponent]'
})
export class AlertComponentDirective implements OnDestroy {
	componentRef;

	@Input('ansynAlertComponent')
	set ansynAlertComponent({ component, mapId }: IAlertComponentSettings) {
		const factory = this.componentFactoryResolver.resolveComponentFactory<IAlertComponent>(component);
		this.componentRef = this.viewContainerRef.createComponent<IAlertComponent>(factory);
		this.componentRef.instance.mapId = mapId;
	};

	constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
