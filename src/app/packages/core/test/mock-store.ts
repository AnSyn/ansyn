import { ActionReducer, State, Store } from '@ngrx/store';
import { getTestBed, TestBed } from '@angular/core/testing';

export interface StoreFixture<T> {
	store: Store<T>;
	state: State<T>;
	cleanup: () => void;
	getState: () => T;
	replaceReducer: (reducer) => void;
}

export function createStore<T>(reducer: ActionReducer<T>, options: any = {}): StoreFixture<T> {
	const testbed: TestBed = getTestBed();
	const store: Store<T> = testbed.get(Store);
	const state: State<T> = testbed.get(State);
	let value: T;
	const getState = (): T => value;
	const cleanup = () => {

	};
	const replaceReducer = reducer => {
		store.replaceReducer(reducer);
	};
	return { store, state, cleanup, getState, replaceReducer };
}
