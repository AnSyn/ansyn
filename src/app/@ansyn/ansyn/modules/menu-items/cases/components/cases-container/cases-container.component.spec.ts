import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesContainerComponent } from './cases-container.component';
import { StoreModule } from '@ngrx/store';
import { casesFeatureKey, CasesReducer } from '../../reducers/cases.reducer';
import { MockComponent } from '../../../../core/test/mock-component';
import { TranslateModule } from '@ngx-translate/core';

describe('CasesContainerComponent', () => {
	let component: CasesContainerComponent;
	let fixture: ComponentFixture<CasesContainerComponent>;
	const mockCasesTable = MockComponent({
		selector: 'ansyn-cases-table',
		inputs: ['cases'],
		outputs: ['onInfintyScroll', 'onHoverCaseRow']
	});
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CasesContainerComponent, mockCasesTable],
			imports: [
				StoreModule.forRoot({[casesFeatureKey]: CasesReducer}),
				TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
