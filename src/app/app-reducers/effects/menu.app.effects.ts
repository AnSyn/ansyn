import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes } from '@ansyn/core';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { redrawTimelineAction } from '@ansyn/overlays'
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class MenuAppEffects {

	constructor(private actions$: Actions) {}

	@Effect()
	onAnimationEnd$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map( () => {
			return new UpdateMapSizeAction()
		});

	@Effect()
	redrawTimeline$: Observable<redrawTimelineAction> = this.actions$
		.ofType(MenuActionTypes.ANIMATION_END)
		.map( () => {
			return new redrawTimelineAction(true);
		});
		
}
