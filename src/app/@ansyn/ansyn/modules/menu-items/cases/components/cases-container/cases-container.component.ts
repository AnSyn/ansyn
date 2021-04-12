import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	casesStateSelector, ICaseModal,
	ICasesState, selectModalState,
	selectMyCasesData,
	selectSharedCasesData
} from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import {
	CopyCaseLinkAction, LoadCaseAction,
	LoadCasesAction,
	OpenModalAction,
	SaveSharedCaseAsMyOwn
} from '../../actions/cases.actions';
import { tap, pluck, distinctUntilChanged } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { CasesType } from '../../models/cases-config';
import { Observable } from 'rxjs';
import { IEntitiesTableData, ITableRowModel } from '../../../../core/models/IEntitiesTableModel';
import { ICasePreview } from '../../models/case.model';
import { AnsynDatePipe } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-cases-container',
	templateUrl: './cases-container.component.html',
	styleUrls: ['./cases-container.component.less']
})
@AutoSubscriptions()
export class CasesContainerComponent implements OnInit, OnDestroy {
	rowsData: ITableRowModel<ICasePreview>[] = [
		{
			headName: 'Case Name',
			propertyName: 'name'
		},
		{
			headName: 'Date create',
			propertyName: 'creationTime',
			pipe: new AnsynDatePipe()
		}
	];
	myCasesData: IEntitiesTableData<ICasePreview>;
	sharedCasesObj: IEntitiesTableData<ICasePreview>;
	hoverCaseId: string;

	modalCaseId$: Observable<string> = this.store$.pipe(
		select(selectModalState),
		distinctUntilChanged(),
		pluck<ICaseModal, string>('id')
	);

	openCaseId$: Observable<string> = this.store$.pipe(
		select(casesStateSelector),
		pluck<ICasesState, string>('openCaseId')
	);

	@AutoSubscription
	getMyCases$ = this.store$.pipe(
		select(selectMyCasesData),
		tap( ([ids, entities]) => {
			this.myCasesData = {
				entities,
				ids
			}
		})
	);

	@AutoSubscription
	getSharedCase$ = this.store$.pipe(
		select(selectSharedCasesData),
		tap( ([ids, entities]) => {
			this.sharedCasesObj = {
				entities,
				ids
			}
		})
	);

	constructor(
		protected store$: Store<ICasesState>
	) {
	}

	ngOnInit(): void {
		this.loadMyCases();
		this.loadSharedCases();
	}

	ngOnDestroy(): void {
	}

	openCase(caseId: string) {
		this.store$.dispatch(new LoadCaseAction(caseId));
	}


	loadMyCases() {
		this.store$.dispatch(new LoadCasesAction())
	}

	loadSharedCases() {
		this.store$.dispatch(new LoadCasesAction(CasesType.MySharedCases))
	}

	removeCase(): void {
		if (this.hoverCaseId) {
			this.store$.dispatch(new OpenModalAction({ type: 'delete', caseId: this.hoverCaseId }));
		}
	}

	editCase() {
		if (this.hoverCaseId) {
			this.store$.dispatch(new OpenModalAction({ type: 'save', caseId: this.hoverCaseId }));
		}
	}

	shareCase() {
		if (this.hoverCaseId) {
			this.store$.dispatch(new CopyCaseLinkAction({ caseId: this.hoverCaseId }));
		}
	}

	saveSharedAsMy() {
		if (this.hoverCaseId) {
			this.store$.dispatch(new SaveSharedCaseAsMyOwn(this.hoverCaseId));
		}
	}

}
