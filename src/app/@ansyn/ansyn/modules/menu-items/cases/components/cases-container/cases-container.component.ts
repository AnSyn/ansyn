import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICasesState, selectMyCasesData } from '../../reducers/cases.reducer';
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

	constructor(protected store$: Store<ICasesState>) {
	}

	ngOnInit(): void {
		this.loadMyCases();
	}

	ngOnDestroy(): void {
	}


	loadMyCases() {
		this.store$.dispatch(new LoadCasesAction())
	}

}
