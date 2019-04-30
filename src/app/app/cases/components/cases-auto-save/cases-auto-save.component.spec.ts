import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesAutoSaveComponent } from './cases-auto-save.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../../reducers/cases.reducer';
import { SliderCheckboxComponent } from '../../../../@ansyn/ansyn/modules/core/forms/slider-checkbox/slider-checkbox.component';
import { SetAutoSave } from '../../actions/cases.actions';
import { ICase } from '../../models/case.model';

describe('CasesAutoSaveComponent', () => {
	let component: CasesAutoSaveComponent;
	let fixture: ComponentFixture<CasesAutoSaveComponent>;
	let store: Store<any>;

	const fakeCase = {
		autoSave: true
	} as ICase;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer })
			],
			declarations: [CasesAutoSaveComponent, SliderCheckboxComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(CasesAutoSaveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click should dispatch UpdateCaseAction', () => {
		spyOn(store, 'dispatch');
		component.onChange(true);
		fixture.detectChanges();
		expect(store.dispatch).toHaveBeenCalledWith(new SetAutoSave(true));
	});
});
