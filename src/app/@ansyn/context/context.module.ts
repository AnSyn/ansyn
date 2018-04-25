import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { ContextReducer, IContextState } from '@ansyn/context/reducers/context.reducer';
import { contextFeatureKey } from '@ansyn/context/reducers/context.reducer';
import { ContextService } from '@ansyn/context/services/context.service';
import { AddAllContextsAction } from '@ansyn/context/actions/context.actions';
import { HttpClientModule } from '@angular/common/http';
import { Context } from '@ansyn/core/models/context.model';


@NgModule({
	imports: [
		HttpClientModule,
		StoreModule.forFeature(contextFeatureKey, ContextReducer)
	],
	providers: [ContextService]
})
export class ContextModule {

	constructor(protected store: Store<IContextState>, protected contextService: ContextService) {
		contextService.loadContexts().subscribe((contexts: Context[]) => {
			this.store.dispatch(new AddAllContextsAction(contexts))
		})
	}
}
