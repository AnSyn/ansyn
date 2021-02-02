import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ICaseModal, ICasesState, selectModalState } from '../../reducers/cases.reducer';
import { Store, select } from '@ngrx/store';
import { CloseModalAction } from '../../actions/cases.actions';
import { tap } from 'rxjs/operators';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';

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
@AutoSubscriptions()
export class CasesModalContainerComponent implements OnInit, OnDestroy {
	modal: ICaseModal;

	@AutoSubscription
	getModal = this.store.pipe(
		select(selectModalState),
		tap( (modal) => this.modal = modal)
	);


	constructor(protected store: Store<ICasesState>) {
	}

	close() {
		this.store.dispatch(new CloseModalAction());
	}

	ngOnInit() {
	}


	ngOnDestroy(): void {
		this.close();
	}

}
