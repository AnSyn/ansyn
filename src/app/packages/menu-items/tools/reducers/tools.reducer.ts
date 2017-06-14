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
	switch(action.type){
		case  ToolsActionsTypes.START_MOUSE_SHADOW: 
			const immFlagsStart = new Map(state.flags);
			immFlagsStart.set('shadow_mouse',true); 	
			//immFlagsStart.set('shadow_mouse_disabled',true);
			return {...state,  flags: immFlagsStart };

		case ToolsActionsTypes.STOP_MOUSE_SHADOW:
			const immFlagsStop = new Map(state.flags);
			immFlagsStop.set('shadow_mouse',false); 	
			return {...state,  flags: immFlagsStop };
		default:
		return state;

	}
}

