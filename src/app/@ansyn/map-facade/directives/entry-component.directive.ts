import { ComponentFactoryResolver, Directive, Input, OnDestroy, ViewContainerRef, ComponentRef, OnInit } from '@angular/core';
import { IAlertComponent } from '../alerts/alerts.model';

export interface IEntryComponent {
	mapId: string;
}

export interface IEntryComponentSettings extends IEntryComponent {
	component: any
}


@Directive({
	selector: '[ansynEntryComponent]'
})
export class EntryComponentDirective implements OnDestroy, OnInit {
	componentRef: ComponentRef<any>;
	@Input('ansynEntryComponent') ansynEntryComponent: IEntryComponentSettings;

	constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnInit(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
		const factory = this.componentFactoryResolver.resolveComponentFactory<IAlertComponent>(this.ansynEntryComponent.component);
		this.componentRef = this.viewContainerRef.createComponent<IAlertComponent>(factory);
		this.componentRef.instance.mapId = this.ansynEntryComponent.mapId;

	};

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
