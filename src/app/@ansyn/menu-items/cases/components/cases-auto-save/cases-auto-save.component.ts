import { Component, HostListener, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
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
		console.log('asa');
		this.store$.dispatch(new UpdateCaseAction({
			updatedCase: <Case> { ...this.currentCase, autoSave },
			forceUpdate: true
		}));
	}

	constructor(protected store$: Store<any>) {
	}

}
