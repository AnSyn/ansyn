import { Actions, Effect } from '@ngrx/effects';
import { ContextMenuDisplayAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';

@Injectable()
export class ContextMenuAppEffects {

	/**
	 * @type Effect
	 * @name onContextMenuDisplayAction$
	 * @ofType ContextMenuDisplayAction
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.ofType<ContextMenuDisplayAction>(MapActionTypes.CONTEXT_MENU.DISPLAY)
		.map(({ payload }) => payload)
		.map(id => new DisplayOverlayFromStoreAction({ id }));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>) {
	}

}
