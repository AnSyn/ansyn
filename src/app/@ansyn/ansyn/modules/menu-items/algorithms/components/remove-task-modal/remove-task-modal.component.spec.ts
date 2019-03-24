import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveTaskModalComponent } from './remove-task-modal.component';
import { FormsModule } from '@angular/forms';
import { AnsynInputComponent } from '../../../../core/public_api';
import { MatInputModule, MatFormFieldModule } from '@angular/material';

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
