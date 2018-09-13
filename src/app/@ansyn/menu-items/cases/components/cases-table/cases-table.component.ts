import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { Store } from '@ngrx/store';
import { CopyCaseLinkAction, LoadCaseAction, LoadCasesAction, OpenModalAction } from '../../actions/cases.actions';
import { getTimeFormat, ICasePreview } from '@ansyn/core';
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
import 'rxjs/add/operator/distinctUntilChanged';
import { Dictionary } from '@ngrx/entity/src/models';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, map, tap } from 'rxjs/internal/operators';

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

	modalCaseId$: Observable<string> = this.caseState$
		.pluck<ICasesState, ICaseModal>('modal')
		.distinctUntilChanged()
		.pluck<ICaseModal, string>('id');

	@AutoSubscription
	selectedCaseId$: Observable<string> = this.caseState$.pipe(
		map((state: ICasesState) => state.selectedCase ? state.selectedCase.id : null),
		distinctUntilChanged(),
		tap((selectedCaseId) => this.selectedCaseId = selectedCaseId)
	);

	selectedCaseId: string;

	constructor(protected store$: Store<ICasesState>, protected casesEffects: CasesEffects) {
		this.casesEffects.onAddCase$.subscribe(this.onCasesAdded.bind(this));
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

	onMouseEnterCaseRow(caseMenu: HTMLDivElement, caseRow: HTMLDivElement, tbodyElement: HTMLDivElement) {
		let offsetTop = caseRow.offsetTop;
		let scrollTop = tbodyElement.scrollTop;
		caseMenu.style.top = `${offsetTop - scrollTop + 1}px`;
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
		this.store$.dispatch(new OpenModalAction({ component: DeleteCaseComponent, caseId }));
	}

	editCase(caseId: string) {
		this.store$.dispatch(new OpenModalAction({ component: EditCaseComponent, caseId }));
	}

	shareCase(caseId: string) {
		this.store$.dispatch(new CopyCaseLinkAction({ caseId: caseId }));
	}

	selectCase(caseId: string): void {
		if (this.selectedCaseId !== caseId) {
			this.store$.dispatch(new LoadCaseAction(caseId));
		}
	}

	formatTime(timeToFormat: Date): string {
		return getTimeFormat(timeToFormat);
	}

}
