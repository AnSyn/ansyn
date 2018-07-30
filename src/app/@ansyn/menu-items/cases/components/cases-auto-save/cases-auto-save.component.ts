import { Component, HostListener, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICase, ICasePreview } from '@ansyn/core/models/case.model';
import { selectCaseEntities } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/index';
import { Dictionary } from '@ngrx/entity/src/models';
import { map, tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { SetAutoSave } from '@ansyn/core/actions/core.actions';

@Component({
	selector: 'ansyn-cases-auto-save',
	templateUrl: './cases-auto-save.component.html',
	styleUrls: ['./cases-auto-save.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class CasesAutoSaveComponent {
	@Input() caseId: string;
	currentCase;

	@AutoSubscription
	currentCase$: Observable<any> = this.store$
		.pipe(
			select(selectCaseEntities),
			map((entities: Dictionary<ICasePreview>) => <ICasePreview> entities[this.caseId]),
			tap((currentCase) => this.currentCase = currentCase)
		);

	@HostListener('click', ['$event']) onClick($event) {
		$event.stopPropagation();
	}

	onChange(autoSave) {
		this.store$.dispatch(new SetAutoSave(autoSave));
	}

	constructor(protected store$: Store<any>) {
	}

}
