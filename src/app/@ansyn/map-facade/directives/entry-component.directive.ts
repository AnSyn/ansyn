import {
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	Input,
	OnDestroy,
	OnInit,
	ViewContainerRef
} from '@angular/core';

/**
 *
 * getType - function that return the type of this component. needed for overlayStatus to
 *    define if this component is part of the buttons part or the notification(Alert) part.
 */
export interface IEntryComponent {
	mapId: string;

	getType(): string;
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
		const factory = this.componentFactoryResolver.resolveComponentFactory<IEntryComponent>(this.ansynEntryComponent.component);
		this.componentRef = this.viewContainerRef.createComponent<IEntryComponent>(factory);
		this.componentRef.instance.mapId = this.ansynEntryComponent.mapId;

	};

	ngOnDestroy(): void {
		if (this.componentRef) {
			this.componentRef.destroy();
		}
	}
}
