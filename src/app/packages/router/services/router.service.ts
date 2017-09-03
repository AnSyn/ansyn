import { Injectable } from '@angular/core';
import { SetStateAction } from '../actions/router.actions';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IRouterState } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { isNil as _isNil } from 'lodash';

@Injectable()
export class AnsynRouterService {

	constructor(private router: Router, private store: Store<IRouterState>) {
		this.onNavigationEnd();
	}

	onNavigationEnd(): void {
		this.router.events
			.filter(e => e instanceof NavigationEnd)
			.map(() => {
				let activated = this.router.routerState.root;
				while(activated.firstChild) {
					activated = activated.firstChild;
				}
				return activated;
			})
			.filter((activated) => activated.snapshot.data.name === 'case' || activated.snapshot.data.name === 'caseChild')
			.map((activated) => {
				const queryParams = activated.snapshot.queryParams;
				const caseId = activated.snapshot.params['caseId'];
				return {caseId, queryParams}
			})
			.do(state => this.store.dispatch(new SetStateAction(state)))
			.subscribe();
	}

}
