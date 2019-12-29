import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveTaskModalComponent } from './remove-task-modal.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AnsynInputComponent } from '../../../../core/forms/ansyn-input/ansyn-input.component';
import { TranslateModule } from '@ngx-translate/core';

describe('RemoveTaskModalComponent', () => {
	let component: RemoveTaskModalComponent;
	let fixture: ComponentFixture<RemoveTaskModalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, MatInputModule, MatFormFieldModule, TranslateModule.forRoot()],
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
