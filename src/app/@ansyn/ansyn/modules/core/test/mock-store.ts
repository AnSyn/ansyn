import { ActionReducer, State, Store } from '@ngrx/store';
import { getTestBed, TestBed } from '@angular/core/testing';

export interface IStoreFixture<T> {
	store: Store<T>;
	state: State<T>;
	cleanup: () => void;
	getState: () => T;
}

export function createStore<T>(reducer: ActionReducer<T>, options: any = {}): IStoreFixture<T> {
	const testbed: TestBed = getTestBed();
	const store: Store<T> = TestBed.inject(Store);
	const state: State<T> = TestBed.inject(State);
	let value: T;
	const getState = (): T => value;
	const cleanup = () => {

	};
	// const replaceReducer = reducer => {
	// 	store.replaceReducer(reducer);
	// };
	return { store, state, cleanup, getState };
}
