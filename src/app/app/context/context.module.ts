import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { contextFeatureKey, ContextReducer, IContextState } from './reducers/context.reducer';
import { ContextService } from './services/context.service';
import { AddAllContextsAction } from './actions/context.actions';
import { HttpClientModule } from '@angular/common/http';
import { IContext } from '@ansyn/core';
import { ContextAppEffects } from '@ansyn/ansyn';
import { EffectsModule } from '@ngrx/effects';


@NgModule({
	imports: [
		HttpClientModule,
		StoreModule.forFeature(contextFeatureKey, ContextReducer),
		EffectsModule.forFeature([
			ContextAppEffects
		])
	],
	providers: [ContextService]
})
export class ContextModule {

	constructor(protected store: Store<IContextState>, protected contextService: ContextService) {
		contextService.loadContexts().subscribe((contexts: IContext[]) => {
			this.store.dispatch(new AddAllContextsAction(contexts));
		});
	}
}
