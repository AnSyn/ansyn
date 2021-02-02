import { Component, OnDestroy, OnInit } from '@angular/core';
import { selectCaseSaved } from '../../reducers/cases.reducer';
import { select, Store } from '@ngrx/store';
import { OpenModalAction } from '../../actions/cases.actions';
import { delay } from 'rxjs/operators';
import { AutoSubscriptions } from 'auto-subscriptions';
import { SelectMenuItemFromOutsideAction } from '@ansyn/menu';
import { MenuItemsKeys } from '../../../../../config/ansyn.config';
import { ComponentVisibilityService } from '../../../../../app-providers/component-visibility.service';
import { ComponentVisibilityItems } from '../../../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-cases-tools',
	templateUrl: './cases-tools.component.html',
	styleUrls: ['./cases-tools.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CasesToolsComponent implements OnInit, OnDestroy {
	// for component
	readonly isCasesShow: boolean;
	//

	currentSaveCase$ = this.store.pipe(
		select(selectCaseSaved),
		delay(0)
	);

	constructor(protected store: Store<any>,
				componentVisibilityService: ComponentVisibilityService) {
		this.isCasesShow = componentVisibilityService.get(ComponentVisibilityItems.CASES);
	}



	showCasesTable(elementRef: HTMLDivElement): void {
		this.store.dispatch(new SelectMenuItemFromOutsideAction({ name: MenuItemsKeys.Cases, elementRef, toggleFromBottom: false }))
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	showSaveModal() {
		this.store.dispatch(new OpenModalAction({type: 'save'}))
	}
}
