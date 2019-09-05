import { initialTasksState, ITasksState, TasksReducer } from './tasks.reducer';
import { SetTaskDrawIndicator } from '../actions/tasks.actions';

describe('TasksReducer', () => {

	it('SET_DRAW_INDICATOR action should set the draw indicator', () => {
		let action: SetTaskDrawIndicator = new SetTaskDrawIndicator(true);

		let result: ITasksState = TasksReducer(initialTasksState, action);
		expect(result.drawIndicator).toBeTruthy();
	});

});
