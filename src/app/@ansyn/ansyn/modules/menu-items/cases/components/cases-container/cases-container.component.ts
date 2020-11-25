import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICasesState, selectMyCasesData, selectSharedCasesData } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import { LoadCasesAction } from '../../actions/cases.actions';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { CasesType, ICaseTableData } from '../../models/cases-config';

@Component({
	selector: 'ansyn-cases-container',
	templateUrl: './cases-container.component.html',
	styleUrls: ['./cases-container.component.less']
})
@AutoSubscriptions()
export class CasesContainerComponent implements OnInit, OnDestroy {
	myCasesData: ICaseTableData;
	sharedCasesObj: ICaseTableData;

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

	constructor(protected store$: Store<ICasesState>) {
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

}
