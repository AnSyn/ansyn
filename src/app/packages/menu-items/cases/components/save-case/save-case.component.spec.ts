import { SaveDefaultCaseAction } from '../../actions/cases.actions';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { SaveCaseComponent } from './save-case.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CasesModule } from '../../cases.module';
import { Store, StoreModule } from '@ngrx/store';
import { HttpModule } from '@angular/http';
import { casesConfig } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';

describe('SaveCaseComponent', () => {
	let component: SaveCaseComponent;
	let fixture: ComponentFixture<SaveCaseComponent>;
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
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => Observable.of(fake_iCasesState));

		fixture = TestBed.createComponent(SaveCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onSubmitCase should call dispatch with UpdateCaseAction and call close()', () => {
		spyOn(component, 'close');
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new SaveDefaultCaseAction(component.case_model));
		expect(component.close).toHaveBeenCalled();
	});
});
