import { Component, HostListener, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { UpdateCaseAction, UpdateCaseBackendAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';

@Component({
	selector: 'ansyn-cases-auto-save',
	templateUrl: './cases-auto-save.component.html',
	styleUrls: ['./cases-auto-save.component.less']
})
export class CasesAutoSaveComponent {
	@Input() currentCase: Case;

	@HostListener('click', ['$event']) onClick($event) {
		$event.stopPropagation();
	}

	onChange(autoSave) {
		this.store$.dispatch(new UpdateCaseAction(<Case> { ...this.currentCase, autoSave }));
		this.store$.dispatch(new UpdateCaseBackendAction(<Case> { ...this.currentCase, autoSave }));
	}

	constructor(protected store$: Store<any>) {
	}

}
