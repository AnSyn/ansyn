import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteComponent } from './auto-complete.component';
import { MockPipe } from '../../test/mock-pipe';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

describe('AutoCompleteComponent', () => {
	let component: AutoCompleteComponent<any>;
	let fixture: ComponentFixture<AutoCompleteComponent<any>>;
	const mockBoldPipe = MockPipe('bold');

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AutoCompleteComponent, mockBoldPipe],
			imports: [
				TranslateModule.forRoot(),
				MatInputModule,
				MatAutocompleteModule,
				ReactiveFormsModule
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AutoCompleteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
