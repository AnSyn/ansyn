import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export { ContextService } from './services/context.service';

export {
	contextAdapter,
	contextFeatureKey, contextFeatureSelector, contextInitialState,
	ContextReducer,
	IContextParams,
	IContextState, selectContextEntities,
	selectContextsArray, selectContextsParams
} from './reducers/context.reducer';

export { ContextActionTypes, ContextActions, SetContextParamsAction } from './actions/context.actions';

export { ContextModule } from './context.module';
