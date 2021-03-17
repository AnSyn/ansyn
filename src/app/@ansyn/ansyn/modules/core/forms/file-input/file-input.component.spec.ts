import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileInputComponent } from './file-input.component';
import { FormsModule } from '@angular/forms';

describe('FileInputComponent', () => {
	let component: FileInputComponent;
	let fixture: ComponentFixture<FileInputComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [FileInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FileInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
