import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ICoreState } from '../reducers/core.reducer';

@Injectable()
export class CoreEffects {


	constructor(protected actions$: Actions,
				protected store$: Store<ICoreState>) {
	}
}
