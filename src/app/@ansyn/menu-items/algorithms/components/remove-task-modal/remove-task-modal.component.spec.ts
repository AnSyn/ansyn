import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveTaskModalComponent } from './remove-task-modal.component';
import { FormsModule } from '@angular/forms';
import { AnsynInputComponent } from '@ansyn/core';

describe('RemoveTaskModalComponent', () => {
	let component: RemoveTaskModalComponent;
	let fixture: ComponentFixture<RemoveTaskModalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
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

	it('submit should emit input value', () => {
		spyOn(component.onSubmit, 'emit');
		component.submit('test');
		expect(component.onSubmit.emit).toHaveBeenCalledWith('test');
	});
});
