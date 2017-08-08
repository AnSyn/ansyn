/**
 * Created by ohad1 on 02/04/2017.
 */
import { ToolsActionsTypes,StartMouseShadow,StopMouseShadow,ToolsActions } from '../actions/tools.actions';

export interface IToolsState {
	flags: Map<string,boolean>;
	activeCenter: number[];
};

export const toolsInitialState: IToolsState = {
	flags: new Map<string,boolean>(),
	activeCenter: [0, 0]
};

export function ToolsReducer(state = toolsInitialState,action: ToolsActions): IToolsState {
	let tmpMap: Map<string,boolean>;
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

		case ToolsActionsTypes.SET_ACTIVE_CENTER:
			return { ...state, activeCenter: action.payload};

		case ToolsActionsTypes.SET_PIN_LOCATION_MODE:
			tmpMap = new Map(state.flags);
			tmpMap.set('pin_location', action.payload);
			return { ...state,  flags: tmpMap };

		case ToolsActionsTypes.GO_TO:
			return { ...state};
		case ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS:

			tmpMap = new Map(state.flags);			
			tmpMap.set('auto_image_processing',action.payload);
			return { ...state,flags: tmpMap };

		case ToolsActionsTypes.ENABLE_AUTO_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set('auto_image_processing_disabled', false);
			tmpMap.set('auto_image_processing', false);						
			return { ...state,flags: tmpMap };

		case ToolsActionsTypes.DISABLE_AUTO_IMAGE_PROCESSING:

			tmpMap = new Map(state.flags);
			tmpMap.set('auto_image_processing_disabled', true);
			tmpMap.set('auto_image_processing', false);			
			return { ...state,flags: tmpMap };

		default:
		return state;

	}
}

