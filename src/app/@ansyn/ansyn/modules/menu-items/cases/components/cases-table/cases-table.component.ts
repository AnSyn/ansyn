import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ICaseModal, ICasesState, selectModalState, } from '../../reducers/cases.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';
import { EntityState, Dictionary } from '@ngrx/entity';
import { OpenModalAction, CopyCaseLinkAction, LoadCaseAction } from '../../actions/cases.actions';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])
	])
];


@Component({
	selector: 'ansyn-cases-table',
	templateUrl: './cases-table.component.html',
	styleUrls: ['./cases-table.component.less'],
	animations
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CasesTableComponent implements OnInit, OnDestroy {
	@ViewChild('tbodyElement') tbodyElement: ElementRef;
	@Input() cases: Dictionary<ICasePreview>;
	@Output() onInfintyScroll = new EventEmitter();

	modalCaseId$: Observable<string> = this.store$.pipe(
		select(selectModalState),
		distinctUntilChanged(),
		pluck<ICaseModal, string>('id')
	);

	selectedCaseId: string;

	constructor(
		protected store$: Store<ICasesState>
	) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}


	onCasesAdded() {
		if (this.tbodyElement) {
			this.tbodyElement.nativeElement.scrollTop = 0;
		}
	}

	onMouseEnterCaseRow(caseRow: HTMLDivElement) {
		caseRow.classList.add('mouse-enter');
	}

	onMouseLeaveCaseRow(caseRow: HTMLDivElement) {
		caseRow.classList.remove('mouse-enter');
	}

	caseMenuClick($event: MouseEvent, caseRow: HTMLDivElement) {
		caseRow.classList.remove('mouse-enter');
		$event.stopPropagation();
	}

	removeCase(caseId: string): void {
		this.store$.dispatch(new OpenModalAction({ type: 'delete', caseId }));
	}

	editCase(caseId: string) {
		this.store$.dispatch(new OpenModalAction({ type: 'save', caseId }));
	}

	shareCase(caseId: string) {
		this.store$.dispatch(new CopyCaseLinkAction({ caseId }));
	}

	selectCase(caseId: string): void {
		this.store$.dispatch(new LoadCaseAction(caseId));
	}

}
