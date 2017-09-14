import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { HttpModule } from '@angular/http';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { CasesModule } from '../../cases.module';
import { Observable } from 'rxjs/Observable';
import { CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { casesConfig } from '@ansyn/menu-items/cases';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditCaseComponent', () => {
	let component: EditCaseComponent;
	let fixture: ComponentFixture<EditCaseComponent>;
	let store: Store<ICasesState>;

	let fake_iCasesState: ICasesState = {
		cases: [
			{id: 'fake_id1', name: 'fake_name1', state: {selected_context_id: null},},
			{id: 'fake_id2', name: 'fake_name2', state: {selected_context_id: null},}
		],
		active_case_id: 'fake_id1',
		modal: true,
		contexts: [],
		contexts_loaded: true,
		selected_case: {id: 'fake_id1', name: 'fake_name1', state: {selected_context_id: null}},
		default_case: {id: 'fake_id3', name: 'fake_name3', state: {selected_context_id: null}}
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, CasesModule, StoreModule.provideStore({cases: CasesReducer}), RouterTestingModule],
			providers: [{provide: casesConfig, useValue: {baseUrl: null}}]
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

	it('onSubmitCase should call dispatch with UpdateCaseAction and close()', () => {
		spyOn(component, 'close');
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction(component.case_model));
		expect(component.close).toHaveBeenCalled();
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
