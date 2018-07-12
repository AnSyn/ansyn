import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesAutoSaveComponent } from './cases-auto-save.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICase } from '@ansyn/core/models/case.model';
import { SliderCheckboxComponent } from '@ansyn/core/components/slider-checkbox/slider-checkbox.component';

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
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateCaseAction({ updatedCase: fakeCase, forceUpdate: true }));
	});
});
