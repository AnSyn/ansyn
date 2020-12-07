import { Component, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { ICasesState, selectMyCasesData, selectSharedCasesData } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import {
	CopyCaseLinkAction,
	LoadCasesAction,
	OpenModalAction,
	SaveSharedCaseAsMyOwn
} from '../../actions/cases.actions';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { CasesType, ICaseTableData } from '../../models/cases-config';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-cases-container',
	templateUrl: './cases-container.component.html',
	styleUrls: ['./cases-container.component.less']
})
@AutoSubscriptions()
export class CasesContainerComponent implements OnInit, OnDestroy {
	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	myCasesData: ICaseTableData;
	sharedCasesObj: ICaseTableData;
	hoverCaseId: string;
	@AutoSubscription
	getMyCases$ = this.store$.pipe(
		select(selectMyCasesData),
		tap( ([ids, entities]) => {
			this.myCasesData = {
				type: CasesType.MyCases,
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
				type: CasesType.MySharedCases,
				entities,
				ids
			}
		})
	);

	constructor(protected store$: Store<ICasesState>, protected translateService: TranslateService) {
	}

	ngOnInit(): void {
		this.loadMyCases();
		this.loadSharedCases();
	}

	ngOnDestroy(): void {
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
