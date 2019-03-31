import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveTaskModalComponent } from './remove-task-modal.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule } from '@angular/material';
import { AnsynInputComponent } from '../../../../core/forms/ansyn-input/ansyn-input.component';

describe('RemoveTaskModalComponent', () => {
	let component: RemoveTaskModalComponent;
	let fixture: ComponentFixture<RemoveTaskModalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, MatInputModule, MatFormFieldModule],
			declarations: [RemoveTaskModalComponent, AnsynInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RemoveTaskModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onSubmit should emit value', () => {
		spyOn(component.submit, 'emit');
		component.onSubmit(true);
		expect(component.submit.emit).toHaveBeenCalledWith(true);
	});
});
