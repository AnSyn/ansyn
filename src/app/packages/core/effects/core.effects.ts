import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ICoreState } from '../reducers/core.reducer';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class CoreEffects {

	@Effect({ dispatch: false })
	actionsLogger$ = this.actions$
		.do((action) => {
			this.loggerService.info(JSON.stringify(action));
		});

	constructor(protected actions$: Actions,
				protected store$: Store<ICoreState>,
				protected loggerService: LoggerService) {
	}
}
