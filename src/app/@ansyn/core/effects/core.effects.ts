import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ICoreState } from '../reducers/core.reducer';
import { Observable } from 'rxjs';
import { CoreActionTypes, SetWasWelcomeNotificationShownFlagAction } from '../actions/core.actions';
import { updateSession } from '../services/core-session.service';
import { tap } from 'rxjs/internal/operators';

@Injectable()
export class CoreEffects {

	@Effect({ dispatch: false })
	onWelcomeNotification$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG)
		.pipe(
			tap((action: SetWasWelcomeNotificationShownFlagAction) => {
				const payloadObj = { wasWelcomeNotificationShown: action.payload };
				updateSession(payloadObj);
			})
		);


	constructor(protected actions$: Actions,
				protected store$: Store<ICoreState>) {
	}
}
