import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { Observable } from 'rxjs/Observable';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CasesService } from '../../services/cases.service';
import { EffectsModule } from '@ngrx/effects';

describe('EditCaseComponent', () => {
	let component: EditCaseComponent;
	let fixture: ComponentFixture<EditCaseComponent>;
	let store: Store<ICasesState>;
	let casesService: CasesService;

	let fake_iCasesState: ICasesState = {
		cases: [
			{ id: 'fake_id1', name: 'fake_name1', state: { selected_context_id: null } },
			{ id: 'fake_id2', name: 'fake_name2', state: { selected_context_id: null } }
		],
		modalCaseId: 'fake_id1',
		modal: true,
		contexts: [],
		contextsLoaded: true,
		selectedCase: { id: 'fake_id1', name: 'fake_name1', state: { selected_context_id: null } },
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				RouterTestingModule
			],
			providers: [{ provide: casesConfig, useValue: { baseUrl: null, defaultCase: { id: 'defaultCaseId' } } }]
		}).compileComponents();
	}));

	beforeEach(inject([Store, CasesService], (_store: Store<ICasesState>, _casesService: CasesService) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fake_iCasesState));

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
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction(component.caseModel));
			expect(component.close).toHaveBeenCalled();
		});

		it('on createMode should get case via selected context, dispatch AddCaseAction and close', () => {
			component.editMode = false;
			spyOn(component, 'close');
			spyOn(casesService.queryParamsHelper, 'updateCaseViaContext').and.returnValue(component.caseModel);
			component.contextsList = ['fakeContext' as any];
			component.onSubmitCase(0);
			expect(casesService.queryParamsHelper.updateCaseViaContext).toHaveBeenCalledWith('fakeContext', component.caseModel);
			expect(store.dispatch).toHaveBeenCalledWith(new AddCaseAction(component.caseModel));
			expect(component.close).toHaveBeenCalled();
		});
	});

	describe('template', () => {
		let template: any;

		beforeEach(() => {
			template = fixture.nativeElement;
		});

		xit('input name text should current case_model name', async(() => {
			let input = template.querySelector('input[name=\'name\']');
			fixture.detectChanges();
			fixture.whenStable().then(() => {
				expect(input.value).toEqual(fake_iCasesState.cases[0].name);
			});
		}));
	});

});
