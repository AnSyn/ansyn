import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { HttpModule } from "@angular/http";
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { Observable } from 'rxjs';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { casesConfig } from '@ansyn/menu-items/cases';

xdescribe('EditCaseComponent', () => {
	let component: EditCaseComponent;
	let fixture: ComponentFixture<EditCaseComponent>;
	let store: Store<ICasesState>;

	let fake_iCasesState: ICasesState = {
		cases: [
			{ id: 'fake_id1', name: 'fake_name1' },
			{ id: 'fake_id2', name: 'fake_name2' }
		],
		active_case_id: 'fake_id1',
		selected_case: {

		},
		modal: true,
		contexts: [],
		contexts_loaded: true
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, CasesModule, StoreModule.provideStore({ cases: CasesReducer })],
			providers: [{ provide: casesConfig, useValue: { casesBaseUrl: null } }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fake_iCasesState));

		fixture = TestBed.createComponent(EditCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('close should call store.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitCase should call dispatch with UpdateCaseAction if case_id exist and CreateCaseAction if not.', () => {
		//active_case_id = null -> CreateCaseAction
		component.case_model.id = undefined;
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new AddCaseAction(component.case_model));
		component.case_model.id = 'some_id_not_null';
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction(component.case_model));
	});
	it('distinctUntilChangedActiveCase should compare between active_case_id of prev state and current', () => {
		let prev_state: ICasesState = { active_case_id: undefined } as any;
		let current_state: ICasesState = { active_case_id: undefined } as any;
		let result: boolean = component.distinctUntilChangedActiveCase(prev_state, current_state);
		expect(result).toBeTruthy();
		current_state.active_case_id = '1234-56789-1011-1213';
		result = component.distinctUntilChangedActiveCase(prev_state, current_state);
		expect(result).toBeFalsy();
	});

	describe("template", () => {
		let template: any;

		beforeEach(() => {
			template = fixture.nativeElement;
		});

		it('input name text should current case_model name', async(() => {
			let input = template.querySelector("input[name='name']");
			fixture.detectChanges();
			fixture.whenStable().then(() => {
				expect(input.value).toEqual(fake_iCasesState.cases[0].name);
			});
		}));
	});

});
