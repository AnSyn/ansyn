import { SaveCaseAsAction } from '../../actions/cases.actions';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { SaveCaseComponent } from './save-case.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CasesModule } from '../../cases.module';
import { Store, StoreModule } from '@ngrx/store';
import { casesConfig } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

describe('SaveCaseComponent', () => {
	let component: SaveCaseComponent;
	let fixture: ComponentFixture<SaveCaseComponent>;
	let store: Store<ICasesState>;

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
		default_case: { id: 'fake_id3', name: 'fake_name3', state: { selected_context_id: null } }
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CasesModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ cases: CasesReducer }),
				RouterTestingModule
			],
			providers: [{ provide: casesConfig, useValue: { baseUrl: null } }]
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

	it('onSubmitCase should call dispatch with SaveCaseAsAction and call close()', () => {
		spyOn(component, 'close');
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new SaveCaseAsAction(component.case_model));
		expect(component.close).toHaveBeenCalled();
	});
});
