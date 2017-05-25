import { StatusActions, StatusBarActionsTypes } from '../actions/status-bar.actions';

export type MapsLayout = {id:string, description:string, maps_count: number};

export interface IStatusBarState {
	layouts: MapsLayout[],
	selected_layout_index: number
}

const layouts: MapsLayout[] = [
	{id: 'layout1', description: 'full screen', maps_count: 1},
	{id: 'layout2', description: '2 maps full', maps_count: 2},
	{id: 'layout3', description: 'full', maps_count: 2},
	{id: 'layout4', description: 'full', maps_count: 3},
	{id: 'layout5', description: 'full', maps_count: 3},
	{id: 'layout6', description: 'full', maps_count: 4}
];

const selected_layout_index = 0;

export const StatusBarInitialState: IStatusBarState = {
	layouts, selected_layout_index
};


export function StatusBarReducer(state = StatusBarInitialState, action: StatusActions): IStatusBarState  {
	switch(action.type){
		case StatusBarActionsTypes.CHANGE_LAYOUT:
			return Object.assign({},state,{selected_layout_index: action.payload});
		default: return state;
	}
}

