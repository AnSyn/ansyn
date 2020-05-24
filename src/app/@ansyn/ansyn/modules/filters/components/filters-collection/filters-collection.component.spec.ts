import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { mapFacadeConfig } from '@ansyn/map-facade';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { CoreConfig } from '../../../core/models/core.config';
import { LoggerConfig } from '../../../core/models/logger.config';
import { MockComponent } from '../../../core/test/mock-component';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { UpdateFacetsAction } from '../../actions/filters.actions';
import { FiltersModule } from '../../filters.module';
import { filtersFeatureKey, FiltersReducer } from '../../reducer/filters.reducer';
import { filtersConfig } from '../../services/filters.service';
import { FiltersCollectionComponent } from './filters-collection.component';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FiltersCollectionComponent', () => {
	let component: FiltersCollectionComponent;
	let fixture: ComponentFixture<FiltersCollectionComponent>;
	let store;
	let handler: Subject<any>;

	const mockAnsynCheckbox = MockComponent({
		selector: 'ansyn-checkbox',
		inputs: ['id', 'checked', 'disabled', 'text'],
		outputs: ['click']
	});

	const mockAnysnFilterContainer = MockComponent({
		selector: 'ansyn-filter-container',
		inputs: ['filter']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				mockAnsynCheckbox,
				mockAnysnFilterContainer
			],
			imports: [
				BrowserAnimationsModule,
				HttpClientModule,
				FiltersModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({
					[filtersFeatureKey]: FiltersReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				TranslateModule.forRoot()
			],
			providers: [
				{ provide: mapFacadeConfig, useValue: {} },
				{ provide: filtersConfig, useValue: { filters: [] } }, {
					provide: LoggerConfig,
					useValue: {}
				}, { provide: CoreConfig, useValue: {} }]
		})
			.compileComponents();
	}));
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		handler = new Subject();
		spyOn(store, 'select').and.returnValue(handler);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FiltersCollectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('showOnlyFavorites call to Action UpdateFacetsAction', () => {
		spyOn(store, 'dispatch');
		component.showOnlyFavorites({});
		const result = new UpdateFacetsAction({ showOnlyFavorites: !component.onlyFavorite });
		expect(store.dispatch).toHaveBeenCalledWith(result);
	});

	it('check that disableShowOnlyFavoritesSelection is been set in subscribe', () => {
		expect(component.disableShowOnlyFavoritesSelection).toBeFalsy();

		handler.next({
			facets: { showOnlyFavorites: false },
			enableOnlyFavoritesSelection: true
		});
		expect(component.disableShowOnlyFavoritesSelection).toBe(false);

		handler.next({
			facets: { showOnlyFavorites: true },
			enableOnlyFavoritesSelection: true
		});
		expect(component.disableShowOnlyFavoritesSelection).toBe(false);

		// we don't want disableShowOnlyFavoritesSelection to change
		component.disableShowOnlyFavoritesSelection = false;
		handler.next({
			facets: { showOnlyFavorites: true },
			enableOnlyFavoritesSelection: false
		});
		expect(component.disableShowOnlyFavoritesSelection).toBe(false);

		component.disableShowOnlyFavoritesSelection = true;
		handler.next({
			facets: { showOnlyFavorites: true },
			enableOnlyFavoritesSelection: false
		});
		expect(component.disableShowOnlyFavoritesSelection).toBe(true);

		handler.next({
			facets: { showOnlyFavorites: false },
			enableOnlyFavoritesSelection: false
		});
		expect(component.disableShowOnlyFavoritesSelection).toBe(true);


	});


});
