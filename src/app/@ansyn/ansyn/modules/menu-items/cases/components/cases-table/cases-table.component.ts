import {
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef,
	ViewChild
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ICaseModal, ICasesState, selectModalState, selectOpenCaseId, } from '../../reducers/cases.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { LoadCaseAction } from '../../actions/cases.actions';
import { ICaseTableData } from '../../models/cases-config';

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
	@Input() cases: ICaseTableData;
	@Input() menu: ElementRef;
	@Output() onInfintyScroll = new EventEmitter();
	@Output() onRowHover = new EventEmitter<string>();

	@ContentChild('menuItem', { static: false }) menuItemRef: TemplateRef<any>;
	modalCaseId$: Observable<string> = this.store$.pipe(
		select(selectModalState),
		distinctUntilChanged(),
		pluck<ICaseModal, string>('id')
	);

	openCaseId$: Observable<string> = this.store$.select(selectOpenCaseId);

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

	onMouseEnterCaseRow(caseRow: HTMLDivElement, caseId: string) {
		this.onRowHover.emit(caseId);
		caseRow.classList.add('mouse-enter');
	}

	onMouseLeaveCaseRow(caseRow: HTMLDivElement) {
		this.onRowHover.emit(undefined);
		caseRow.classList.remove('mouse-enter');
	}

	caseMenuClick($event: MouseEvent, caseRow: HTMLDivElement) {
		caseRow.classList.remove('mouse-enter');
		$event.stopPropagation();
	}

	selectCase(caseId: string): void {
		if (caseId) {
			this.store$.dispatch(new LoadCaseAction(caseId));
		}
	}
}
