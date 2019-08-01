import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { of } from 'rxjs';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { casesConfig, CasesService } from '../../services/cases.service';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditCaseComponent', () => {
	let component: EditCaseComponent;
	let fixture: ComponentFixture<EditCaseComponent>;
	let store: Store<ICasesState>;
	let casesService: CasesService;

	let fakeICasesState: ICasesState = {
		entities: {
			'fakeId1': { id: 'fakeId1', name: 'fakeName1', state: { selectedContextId: null } },
			'fakeId2': { id: 'fakeId2', name: 'fakeName2', state: { selectedContextId: null } }
		},
		ids: ['fakeId1', 'fakeId2'],
		modal: {
			show: true,
			id: 'fakeId1'
		},
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
				{ provide: casesConfig, useValue: { schema: null, defaultCase: { id: 'defaultCaseId' } } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, CasesService], (_store: Store<ICasesState>, _casesService: CasesService) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => of(fakeICasesState));

		fixture = TestBed.createComponent(EditCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		casesService = _casesService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('close should call store.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	describe('onSubmitCase', () => {
		it('on editMode should call dispatch with UpdateCaseAction and close()', () => {
			component.editMode = true;
			spyOn(component, 'close');
			component.onSubmitCase(0);
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction({
				updatedCase: component.caseModel,
				forceUpdate: true
			}));
			expect(component.close).toHaveBeenCalled();
		});

		it('on createMode should get case via selected context, dispatch AddCaseAction and close', () => {
			component.editMode = false;
			spyOn(component, 'close');
			spyOn(casesService.queryParamsHelper, 'updateCaseViaContext').and.returnValue(component.caseModel);
			component.contextsList = ['fakeContext' as any];
			spyOn(casesService, 'createCase').and.callFake((value) => of(value));
			component.onSubmitCase(0);
			expect(casesService.queryParamsHelper.updateCaseViaContext).toHaveBeenCalledWith('fakeContext', component.caseModel);
			expect(store.dispatch).toHaveBeenCalledWith(new AddCaseAction(component.caseModel));
			expect(component.close).toHaveBeenCalled();
		});
	});

});
