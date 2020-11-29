import {
	AddCasesAction,
	LogRenameCase,
	SaveCaseAsAction,
	SelectCaseSuccessAction,
	UpdateCaseAction
} from '../../actions/cases.actions';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { casesFeatureKey, CasesReducer, ICasesState } from '../../reducers/cases.reducer';
import { SaveCaseComponent } from './save-case.component';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ICase } from '../../models/case.model';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnsynInputComponent } from '../../../../core/forms/ansyn-input/ansyn-input.component';
import { AnsynFormsModule } from '../../../../core/forms/ansyn-forms.module';

const caseDate = new Date();
const fakeCase: Partial<ICase> = {
	creationTime: caseDate,
	id: 'fake-case-id',
	name: 'fake-case-name',
};

describe('SaveCaseComponent', () => {
	let component: SaveCaseComponent;
	let fixture: ComponentFixture<SaveCaseComponent>;
	let store: Store<ICasesState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				SaveCaseComponent,
				AnsynInputComponent
			],
			imports: [
				FormsModule,
				AnsynFormsModule,
				BrowserAnimationsModule,
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer }),
				TranslateModule.forRoot()
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICasesState>) => {
		fixture = TestBed.createComponent(SaveCaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		store.dispatch(new AddCasesAction({ cases: [<any>fakeCase] }));
		store.dispatch(new SelectCaseSuccessAction(<any>fakeCase));
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onSubmitCase should call dispatch with SaveCaseAsAction when there is not caseId', () => {
		spyOn(store, 'dispatch');
		spyOn(component, 'close');
		component.caseId = undefined;
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new SaveCaseAsAction(<any>{
			...fakeCase,
			name: component.caseName
		}));
		expect(component.close).toHaveBeenCalled();
	});

	it('onSubmitCase should call dispatch with LogRenameCase & UpdateCaseAction when there is caseId', fakeAsync(() => {
		spyOn(store, 'dispatch');
		spyOn(component, 'close');
		component.caseId = 'fake-case-id';
		tick();
		component.caseName = 'new-case-name';
		component.onSubmitCase();
		expect(store.dispatch).toHaveBeenCalledWith(new LogRenameCase({
			oldName: 'fake-case-name',
			newName: 'new-case-name'
		}));
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction({
			updatedCase: <any>{
				...fakeCase,
				name: 'new-case-name'
			}, forceUpdate: true
		}));
		expect(component.close).toHaveBeenCalled();
	}))
});
