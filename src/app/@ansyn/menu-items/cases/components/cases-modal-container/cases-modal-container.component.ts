import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CasesEffects } from '../../effects/cases.effects';
import { Observable } from 'rxjs/Observable';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { Store } from '@ngrx/store';
import { CloseModalAction, OpenModalAction } from '../../actions/cases.actions';

import 'rxjs/add/operator/distinctUntilChanged';
import { CaseModal } from '@ansyn/menu-items';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('blackScreen', [
		transition(':enter', [style({ opacity: 0 }), animate(animationsDuring, style({ opacity: 1 }))]),
		transition(':leave', [style({ opacity: 1 }), animate(animationsDuring, style({ opacity: 0 }))])
	])
];

@Component({
	selector: 'ansyn-cases-modal-container',
	templateUrl: './cases-modal-container.component.html',
	styleUrls: ['./cases-modal-container.component.less'],
	animations
})
export class CasesModalContainerComponent implements OnInit, OnDestroy {
	@ViewChild('modalContent', { read: ViewContainerRef }) modalContent: ViewContainerRef;
	show$: Observable<boolean> = this.store.select(casesStateSelector)
		.pluck <ICasesState, CaseModal>('modal')
		.map((modal: CaseModal) => modal.show)
		.distinctUntilChanged();

	selectedComponentRef;

	constructor(public casesEffects: CasesEffects, protected componentFactoryResolver: ComponentFactoryResolver, protected store: Store<ICasesState>) {
	}

	close() {
		this.store.dispatch(new CloseModalAction());
	}

	ngOnInit() {
		this.casesEffects.openModal$.subscribe(this.buildTemplate.bind(this));
		this.casesEffects.closeModal$.subscribe(this.destroyTemplate.bind(this));
	}

	buildTemplate(action: OpenModalAction) {
		let factory = this.componentFactoryResolver.resolveComponentFactory(action.payload.component);
		this.selectedComponentRef = this.modalContent.createComponent(factory);
	}

	destroyTemplate() {
		if (this.selectedComponentRef) {
			this.selectedComponentRef.destroy();
		}
	}

	ngOnDestroy(): void {
		this.close();
	}

}
