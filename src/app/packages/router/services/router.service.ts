import { Injectable, Injector } from '@angular/core';
import { SetStateAction } from '../actions/router.actions';
import { NavigationEnd, Router } from '@angular/router';
import { IRouterState } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AnsynRouterService {

	constructor(private store: Store<IRouterState>,  private injector: Injector) {}

	get router(): Router {
		return this.injector.get(Router);
	}

	onNavigationEnd(): Observable<any> {
		return this.router.events
			.filter(e => e instanceof NavigationEnd)
			.map(() => {
				let activated = this.router.routerState.root;
				while(activated.firstChild) {
					activated = activated.firstChild;
				}
				return activated;
			})
			.filter(activated => activated.snapshot.data.name === 'case' || activated.snapshot.data.name === 'caseChild')
			.map(activated => {
				const queryParamMap = activated.snapshot.queryParamMap;
				const queryParams = {};
				queryParamMap.keys.forEach(key => {queryParams[key] = queryParamMap.get(key)});
				const caseId = activated.snapshot.paramMap.get('caseId');
				return {caseId, queryParams}
			})
			.do(state => this.store.dispatch(new SetStateAction(state)))
	}

}
