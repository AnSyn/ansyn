import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from "@angular/animations";
import { ComponentFactoryResolver } from "@angular/core";
import { CasesEffects } from '../../effects/cases.effects';
import { Observable } from 'rxjs';
import { ICasesState } from '../../reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { CloseModalAction, OpenModalAction } from '../../actions/cases.actions';

const animations_during = '0.2s';

const animations: any[] = [
	trigger('blackScreen', [
		transition(":enter", [style({ opacity: 0}), animate(animations_during, style({ opacity: 1}))]),
		transition(":leave", [style({ opacity: 1}), animate(animations_during, style({ opacity: 0}))]),
	])
];

@Component({
	selector: 'ansyn-cases-modal-container',
	templateUrl: './cases-modal-container.component.html',
	styleUrls: ['./cases-modal-container.component.less'],
	animations
})
export class CasesModalContainerComponent implements OnInit, OnDestroy {
	@ViewChild("modal_content", {read: ViewContainerRef}) modal_content: ViewContainerRef;
	modal$: Observable <boolean> = this.store.select("cases").map((state: ICasesState) => state.modal);
	selected_component_ref;

	constructor(public casesEffects: CasesEffects, private componentFactoryResolver: ComponentFactoryResolver, private store: Store<ICasesState>) {}

	close() {
		this.store.dispatch(new CloseModalAction());
	}

	ngOnInit() {
		this.casesEffects.openModal$.subscribe(this.buildTemplate.bind(this));
		this.casesEffects.closeModal$.subscribe(this.destroyTemplate.bind(this));
	}

	buildTemplate(action: OpenModalAction) {
		let factory = this.componentFactoryResolver.resolveComponentFactory(action.payload.component);
		this.selected_component_ref = this.modal_content.createComponent(factory);
	}

	destroyTemplate() {
		if(this.selected_component_ref) {
			this.selected_component_ref.destroy();
		}
	}

	ngOnDestroy(): void {
		this.close();
	}

}
