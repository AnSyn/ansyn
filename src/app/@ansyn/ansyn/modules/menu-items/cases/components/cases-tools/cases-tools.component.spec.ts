import { SaveCaseComponent } from '../save-case/save-case.component';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesToolsComponent } from './cases-tools.component';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { OpenModalAction } from '../../actions/cases.actions';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { casesConfig } from '../../services/cases.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { TranslateModule } from '@ngx-translate/core';
import { mapFacadeConfig } from '@ansyn/map-facade';

describe('CasesToolsComponent', () => {
	let component: CasesToolsComponent;
	let fixture: ComponentFixture<CasesToolsComponent>;
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

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesToolsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('add-case button should call showCaseModal()', () => {
		spyOn(component, 'showEditCaseModal');
		let button = fixture.nativeElement.querySelector('button:nth-child(1)');
		button.click();
		fixture.detectChanges();
		expect(component.showEditCaseModal).toHaveBeenCalled();
	});

	it('showEditCaseModal should call store.dispatch with OpenModalAction', () => {
		component.showEditCaseModal();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ type: 'edit' }));
	});

	it('save-case button should call showCaseModal()', () => {
		spyOn(component, 'showSaveCaseModal');
		const button = fixture.nativeElement.querySelector('button:nth-child(2)');
		button.click();
		fixture.detectChanges();
		expect(component.showSaveCaseModal).toHaveBeenCalled();
	});

	it('showSaveCaseModal should call store.dispatch with showSaveCaseModal', () => {
		component.showSaveCaseModal();
		expect(store.dispatch).toHaveBeenCalledWith(new OpenModalAction({ type: 'save' }));
	});
});
