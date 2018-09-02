import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { contextFeatureKey, ContextReducer, IContextState } from '@ansyn/context/reducers/context.reducer';
import { ContextService } from '@ansyn/context/services/context.service';
import { AddAllContextsAction } from '@ansyn/context/actions/context.actions';
import { HttpClientModule } from '@angular/common/http';
import { IContext } from '@ansyn/core/models/context.model';
import { EffectsModule } from '@ngrx/effects';
import { ContextEffects } from '@ansyn/context/effects/context.effects';
import { Observable } from 'rxjs';

export class ImisightContextService extends ContextService {
	loadContexts() {
		return Observable.of([]);
	}
}

@NgModule({
	imports: [
		HttpClientModule,
		StoreModule.forFeature(contextFeatureKey, ContextReducer),
		EffectsModule.forFeature([ContextEffects])
	],
	providers: [{ provide: ContextService, useClass: ImisightContextService }]
})
export class ContextModule {

	constructor(protected store: Store<IContextState>,
				protected contextService: ContextService) {
		contextService.loadContexts().subscribe((contexts: IContext[]) => {
			this.store.dispatch(new AddAllContextsAction(contexts));
		});
	}
}
