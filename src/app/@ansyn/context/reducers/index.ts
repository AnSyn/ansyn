import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { contextAdapter } from '@ansyn/context/reducers/context.reducer';
import { Context } from '@ansyn/core/models'
export const contextFeatureKey = 'context';
export const contextFeatureSelector = createFeatureSelector(contextFeatureKey);
export const selectContextsArray = createSelector(contextFeatureSelector, contextAdapter.getSelectors().selectAll);
