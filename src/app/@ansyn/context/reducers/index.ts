import { createFeatureSelector, createSelector } from '@ngrx/store';
import { contextAdapter } from '@ansyn/context/reducers/context.reducer';

export const contextFeatureKey = 'context';
export const contextFeatureSelector = createFeatureSelector(contextFeatureKey);
export const selectContextsArray = createSelector(contextFeatureSelector, contextAdapter.getSelectors().selectAll);
