import { ComponentFactoryResolver, Directive, Input, OnDestroy, ViewContainerRef, ComponentRef } from '@angular/core';
import { IAlertComponent } from '../alerts/alerts.model';
import { IMapSettings } from '@ansyn/imagery';

export interface IEntryComponent {
	mapState: IMapSettings;
}

export interface IEntryComponentSettings extends IEntryComponent {
	component: any
}


@Directive({
	selector: '[ansynEntryComponent]'
})
export class EntryComponentDirective implements OnDestroy {
	componentRef: ComponentRef<any>;

	@Input('ansynEntryComponent')
	set ansynEntryComponent({ component, mapState }: IEntryComponentSettings) {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
		const factory = this.componentFactoryResolver.resolveComponentFactory<IAlertComponent>(component);
		this.componentRef = this.viewContainerRef.createComponent<IAlertComponent>(factory);
		this.componentRef.instance.mapState = mapState;

	};

	constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
