import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CasesAutoSaveComponent } from './cases-auto-save.component';
import { Store, StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';

describe('CasesAutoSaveComponent', () => {
	let component: CasesAutoSaveComponent;
	let fixture: ComponentFixture<CasesAutoSaveComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({[casesFeatureKey]: CasesReducer})
			],
			declarations: [CasesAutoSaveComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesAutoSaveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
