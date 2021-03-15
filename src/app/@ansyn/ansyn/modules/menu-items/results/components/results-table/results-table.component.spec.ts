import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultsTableComponent } from './results-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import {
	IOverlaysState,
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey
} from '../../../../overlays/reducers/overlays.reducer';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp
} from '../../../../overlays/actions/overlays.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mapFacadeConfig, MapFacadeModule } from '@ansyn/map-facade';
import { EffectsModule } from '@ngrx/effects';

describe('ResultsTableComponent', () => {
	let component: ResultsTableComponent;
	let fixture: ComponentFixture<ResultsTableComponent>;
	let store: Store<IOverlaysState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(),
				MapFacadeModule,
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
				EffectsModule.forRoot([]),
				BrowserAnimationsModule],
			declarations: [ResultsTableComponent],
			providers: [
				{ provide: mapFacadeConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IOverlaysState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(ResultsTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('openOverlay should dispatch DisplayOverlayFromStoreAction', () => {
		const id = '';
		component.openOverlay(id);
		expect(store.dispatch).toHaveBeenCalledWith(new DisplayOverlayFromStoreAction({ id }));
	});

	it('openOverlayOverview should dispatch SetMarkUp', () => {
		const $event = { currentTarget: { id: '234' } };
		const id = '1';
		component.openOverlayOverview($event, id);
		expect(store.dispatch).toHaveBeenCalledWith(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			customOverviewElementId: $event.currentTarget.id
		}));
	});


	it('closeOverlayOverview should dispatch SetMarkUp', () => {
		component.closeOverlayOverview();
		expect(store.dispatch).toHaveBeenCalledWith(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [] }
		}));
	});
});
