import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Store } from '@ngrx/store';
import { HoverFeatureTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { Case } from '@ansyn/core/models/case.model';
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Injectable()
export class VisualizersAppEffects {

	@Effect()
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([action, selectedCase]: [HoverFeatureTriggerAction, Case]) => {
			const markups = this.casesService.getOverlaysMarkup(selectedCase, action.payload);
			return new OverlaysMarkupAction(markups);
		});

	constructor(
		private actions$: Actions,
		private store$: Store<IAppState>,
		private casesService: CasesService
	){}

}
