import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectShowCasesTable } from '../../reducers/cases.reducer';
import { distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-cases',
	templateUrl: './cases.component.html',
	styleUrls: ['./cases.component.less']
})

export class CasesComponent {
	isTableOpen$ = this.store$.pipe(
		select(selectShowCasesTable),
		distinctUntilChanged(),
	);
	constructor(protected store$: Store) {
	}
}
