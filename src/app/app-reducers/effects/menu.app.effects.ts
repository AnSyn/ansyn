import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes } from '@ansyn/menu';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { IAppState } from '../';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class MenuAppEffects {

	@Effect()
	onAnimationEnd$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map(() => {
			return new UpdateMapSizeAction();
		});

	@Effect()
	redrawTimeline$: Observable<RedrawTimelineAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map(() => {
			return new RedrawTimelineAction(true);
		});

	constructor(private actions$: Actions) {
	}
}
