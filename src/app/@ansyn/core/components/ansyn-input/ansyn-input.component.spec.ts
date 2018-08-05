import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynInputComponent } from './ansyn-input.component';
import { FormsModule } from '@angular/forms';

describe('AnsynInputComponent', () => {
	let component: AnsynInputComponent;
	let fixture: ComponentFixture<AnsynInputComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [AnsynInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
