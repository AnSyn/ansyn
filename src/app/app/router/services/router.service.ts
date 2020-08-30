import { Injectable, Injector } from '@angular/core';
import { SetStateAction } from '../actions/router.actions';
import { NavigationEnd, Router } from '@angular/router';
import { IRouterState } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable()
export class AnsynRouterService {

	constructor(protected store: Store<IRouterState>, protected injector: Injector) {
	}

	get router(): Router {
		return this.injector.get(Router);
	}

	onNavigationEnd(): Observable<any> {
		return this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			map(() => {
				let activated = this.router.routerState.root;
				while (activated.firstChild) {
					activated = activated.firstChild;
				}
				return activated;
			}),
			filter(activated => activated.snapshot.data.name === 'case' ||
				activated.snapshot.data.name === 'caseChild' ||
				activated.snapshot.data.name === 'link' ||
				activated.snapshot.data.name === 'linkChild'
			),
			map(activated => {
				const { queryParamMap } = activated.snapshot;
				const queryParams = {};
				const linkId = activated.snapshot.params.linkId;

				queryParamMap.keys.forEach(key => {
					queryParams[key] = queryParamMap.get(key);
				});

				const caseId = activated.snapshot.paramMap.get('caseId');
				return { caseId, queryParams, linkId };
			}),
			tap(state => this.store.dispatch(new SetStateAction(state)))
		)
	}

}
