import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { contextFeatureKey, ContextReducer, IContextState } from './reducers/context.reducer';
import { ContextService } from './services/context.service';
import { HttpClientModule } from '@angular/common/http';
import { IContext } from '@ansyn/ansyn';
import { EffectsModule } from '@ngrx/effects';
import { ContextAppEffects } from './effects/context.app.effects';
import { ImageryModule } from '@ansyn/imagery';
import { ContextEntityVisualizer } from './plugins/context-entity.visualizer';
import { AddAllContextsAction } from './actions/context.actions';


@NgModule({
	imports: [
		HttpClientModule,
		StoreModule.forFeature(contextFeatureKey, ContextReducer),
		EffectsModule.forFeature([
			ContextAppEffects
		]),
		ImageryModule.provide({
			maps: [],
			mapSourceProviders: [],
			plugins: [
				ContextEntityVisualizer
			]
		})
	],
	providers: [ContextService]
})
export class ContextModule {

	constructor(protected store: Store<IContextState>, protected contextService: ContextService) {
		contextService.loadContexts().subscribe((contexts: IContext[]) => {
			this.store.dispatch(AddAllContextsAction({payload: contexts}));
		});
	}
}
