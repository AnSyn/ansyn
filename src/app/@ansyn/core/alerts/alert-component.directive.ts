import { ComponentFactoryResolver, Directive, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[ansynAlertComponent]'
})
export class AlertComponentDirective implements OnInit, OnDestroy {
	componentRef;

	@Input('ansynAlertComponent')
	set ansynAlertComponent(component: any) {
		const factory = this.componentFactoryResolver.resolveComponentFactory(component);
		this.componentRef = this.viewContainerRef.createComponent(factory);
	};

	constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
