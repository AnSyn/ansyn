import { AlgorithmsReducer, IAlgorithmState, initialAlgorithmsState } from './algorithms.reducer';
import { SetAlgorithmTaskDrawIndicator } from '../actions/algorithms.actions';

describe('AlgorithmsReducer', () => {

	it('SET_DRAW_INDICATOR action should set the draw indicator', () => {
		let action: SetAlgorithmTaskDrawIndicator = new SetAlgorithmTaskDrawIndicator(true);

		let result: IAlgorithmState = AlgorithmsReducer(initialAlgorithmsState, action);
		expect(result.drawIndicator).toBeTruthy();
	});

});
