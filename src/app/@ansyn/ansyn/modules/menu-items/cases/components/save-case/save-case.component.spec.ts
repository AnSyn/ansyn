import { SaveCaseAsAction } from '../../actions/cases.actions';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { SaveCaseComponent } from './save-case.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CasesModule } from '../../cases.module';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';
import { casesConfig } from '../../services/cases.service';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mapFacadeConfig } from '@ansyn/map-facade';
import { linksConfig } from '../../services/helpers/cases.service.query-params-helper';

describe('SaveCaseComponent', () => {
	let component: SaveCaseComponent;
	let fixture: ComponentFixture<SaveCaseComponent>;
	let store: Store<ICasesState>;

	let fakeICasesState: ICasesState = {
		cases: [
			{ id: 'fakeId1', name: 'fakeName1', state: { selectedContextId: null } },
			{ id: 'fakeId2', name: 'fakeName2', state: { selectedContextId: null } }
		],
		modalCaseId: 'fakeId1',
		modal: true,
		selectedCase: { id: 'fakeId1', name: 'fakeName1', state: { selectedContextId: null } }
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				BrowserAnimationsModule,
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				RouterTestingModule,
				TranslateModule.forRoot()
			],
			providers: [
				DataLayersService,
				{ provide: linksConfig, useValue: {} },
				{ provide: casesConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} },
				{ provide: mapFacadeConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		fixture = TestBed.createComponent(SaveCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onSubmitCase should call dispatch with SaveCaseAsAction and call close()', () => {
		spyOn(store, 'dispatch');
		spyOn(component, 'close');
		spyOn(store, 'select').and.callFake(() => of({state: {maps: {data: []}}}));
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new SaveCaseAsAction(<any>{ name: component.caseName, state: {maps: {data: []}}}));
		expect(component.close).toHaveBeenCalled();
	});
});
