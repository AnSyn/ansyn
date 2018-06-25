import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case, CasePreview } from '@ansyn/core/models/case.model';
import { selectCaseEntities } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/index';
import { Dictionary } from '@ngrx/entity/src/models';
import { map, tap } from 'rxjs/internal/operators';

@Component({
	selector: 'ansyn-cases-auto-save',
	templateUrl: './cases-auto-save.component.html',
	styleUrls: ['./cases-auto-save.component.less']
})
export class CasesAutoSaveComponent implements OnInit, OnDestroy {
	@Input() caseId: string;
	currentCase;
	subscribers = [];

	currentCase$: Observable<any> = this.store$.select(selectCaseEntities)
		.pipe(
			map((entities: Dictionary<CasePreview>) => <CasePreview> entities[this.caseId]),
			tap((currentCase) => this.currentCase = currentCase)
		);

	@HostListener('click', ['$event']) onClick($event) {
		$event.stopPropagation();
	}

	onChange(autoSave) {
		this.store$.dispatch(new UpdateCaseAction({
			updatedCase: <Case> { ...this.currentCase, autoSave },
			forceUpdate: true
		}));
	}

	ngOnInit() {
		this.subscribers.push(
			this.currentCase$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscribers.forEach((sub) => sub.unsubscribe());
	}

	constructor(protected store$: Store<any>) {
	}

}
