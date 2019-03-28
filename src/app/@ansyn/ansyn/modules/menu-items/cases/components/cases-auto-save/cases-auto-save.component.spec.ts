import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesAutoSaveComponent } from './cases-auto-save.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../../reducers/cases.reducer';
import { SetAutoSave, SliderCheckboxComponent } from '../../../../core/public_api';
import { ICase } from '@ansyn/imagery';

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
