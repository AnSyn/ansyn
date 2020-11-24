import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CopyCaseLinkAction, LoadCaseAction, LoadCasesAction, OpenModalAction } from '../../actions/cases.actions';
import { CasesEffects } from '../../effects/cases.effects';
import { Observable } from 'rxjs';
import {
	casesStateSelector,
	ICaseModal,
	ICasesState,
	selectCaseEntities,
	selectCasesIds
} from '../../reducers/cases.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, map, pluck, tap } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';
import { Dictionary } from '@ngrx/entity';

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

	caseState$: Observable<ICasesState> = this.store$.select(casesStateSelector);

	ids$: Observable<string[] | number[]> = this.store$.select(selectCasesIds);
	entities$: Observable<Dictionary<ICasePreview>> = this.store$.select(selectCaseEntities);

	modalCaseId$: Observable<string> = this.caseState$.pipe(
		pluck<ICasesState, ICaseModal>('modal'),
		distinctUntilChanged(),
		pluck<ICaseModal, string>('id')
	);

	@AutoSubscription
	selectedCaseId$: Observable<string> = this.caseState$.pipe(
		map((state: ICasesState) => state.selectedCase ? state.selectedCase.id : null),
		distinctUntilChanged(),
		tap((selectedCaseId) => this.selectedCaseId = selectedCaseId)
	);

	selectedCaseId: string;

	constructor(
		protected store$: Store<ICasesState>
	) {
	}

	ngOnInit(): void {
		this.loadCases();
	}

	ngOnDestroy(): void {
	}

	loadCases() {
		this.store$.dispatch(new LoadCasesAction());
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

	shareCase(caseId: string, caseName: string) {
		this.store$.dispatch(new CopyCaseLinkAction({ caseId, caseName }));
	}

	selectCase(caseId: string): void {
		this.store$.dispatch(new LoadCaseAction(caseId));
	}

}
