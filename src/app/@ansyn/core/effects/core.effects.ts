import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ICoreState } from '../reducers/core.reducer';
import { Observable } from 'rxjs/Observable';
import { CoreActionTypes, SetWasWelcomeNotificationShownFlagAction } from '@ansyn/core';
import { updateSession } from '@ansyn/core/services/core-session.service';

@Injectable()
export class CoreEffects {

	/**
	 * @type Effect
	 * @name onWelcomeNotification$
	 * @ofType SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG
	 */
	@Effect({ dispatch: false })
	onWelcomeNotification$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG)
		.do((action: SetWasWelcomeNotificationShownFlagAction) => {
			const payloadObj = {wasWelcomeNotificationShown: action.payload};
			updateSession(payloadObj);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<ICoreState>) {
	}
}
