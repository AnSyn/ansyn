import { Store, StoreModule } from '@ngrx/store';
import { FiltersModule } from '../../filters.module';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { filtersFeatureKey, FiltersReducer } from '../../reducer/filters.reducer';
import { FiltersCollectionComponent } from './filters-collection.component';
import { filtersConfig } from '../../services/filters.service';
import { Subject } from 'rxjs';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { UpdateFacetsAction } from '../../actions/filters.actions';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { MockComponent } from '../../../../core/test/mock-component';
import { mapFacadeConfig } from '@ansyn/map-facade';

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
				HttpClientModule,
				FiltersModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [filtersFeatureKey]: FiltersReducer })
			],
			providers: [
				{ provide: mapFacadeConfig, useValue: {} },
				{ provide: filtersConfig, useValue: { filters: null } }, {
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
