import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { contextFeatureKey, ContextReducer, IContextState } from './reducers/context.reducer';
import { ContextService } from './services/context.service';
import { AddAllContextsAction } from './actions/context.actions';
import { HttpClientModule } from '@angular/common/http';
import { IContext } from '@ansyn/core/models/context.model';


@NgModule({
	imports: [
		HttpClientModule,
		StoreModule.forFeature(contextFeatureKey, ContextReducer)
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
