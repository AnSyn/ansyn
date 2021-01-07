import { async, ComponentFixture, TestBed, tick, inject, fakeAsync } from '@angular/core/testing';
import { CasesModalContainerComponent } from './cases-modal-container.component';
import { CasesModule } from '../../cases.module';
import { CloseModalAction, OpenModalAction } from '../../actions/cases.actions';
import { StoreModule, Store } from '@ngrx/store';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';
import { casesConfig } from '../../services/cases.service';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { TranslateModule } from '@ngx-translate/core';
import { mapFacadeConfig } from '@ansyn/map-facade';

describe('ModalContainerComponent', () => {
	let component: CasesModalContainerComponent;
	let fixture: ComponentFixture<CasesModalContainerComponent>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				RouterTestingModule,
				TranslateModule.forRoot()
			],
			providers: [
				DataLayersService,
				{ provide: casesConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} },
				{ provide: mapFacadeConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesModalContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach( (inject([Store], (_store: Store<ICasesState>) => {
			store = _store;
	})));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('dispatch OpenModal with edit type should open ansyn-edit-case', fakeAsync(() => {
		store.dispatch(new OpenModalAction({ type: 'save' }));
		tick();
		expect(fixture.nativeElement.querySelector('ansyn-edit-case')).toBeDefined();
	}));

	it('dispatch OpenModal with delete type should open ansyn-delete-case', fakeAsync(() => {
		store.dispatch(new OpenModalAction({ type: 'delete' }));
		tick();
		expect(fixture.nativeElement.querySelector('ansyn-delete-case')).toBeDefined();
	}));

	it('click outside the modal should dispatch CloseModal', () => {
		spyOn(store, 'dispatch');
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});
});
