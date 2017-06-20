/**
 * Created by ohad1 on 02/04/2017.
 */
import { ToolsActionsTypes,StartMouseShadow,StopMouseShadow,ToolsActions } from '../actions/tools.actions';

export interface IToolsState {

	flags: Map<string,boolean>;
};

export const toolsInitialState: IToolsState = {
	flags: new Map<string,boolean>()
};

export function ToolsReducer(state = toolsInitialState,action: ToolsActions): IToolsState {
	let tmpMap :Map<string,boolean>;
	switch(action.type){
		case  ToolsActionsTypes.START_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadow_mouse',true);
			return { ...state,  flags: tmpMap };

		case ToolsActionsTypes.STOP_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadow_mouse',false);
			return { ...state,  flags: tmpMap };

		case ToolsActionsTypes.DISABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadow_mouse_disabled',true);
			return { ...state,flags: tmpMap };

		case ToolsActionsTypes.ENABLE_MOUSE_SHADOW:

			tmpMap = new Map(state.flags);
			tmpMap.set('shadow_mouse_disabled',false);
			return { ...state,flags: tmpMap };

		default:
		return state;

	}
}

