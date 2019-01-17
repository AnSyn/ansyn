import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSensorNameComponent } from './edit-sensor-name.component';
import { FormsModule } from '@angular/forms';
import { AnsynInputComponent } from '@ansyn/core';
import { MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('EditSensorNameComponent', () => {
	let component: EditSensorNameComponent;
	let fixture: ComponentFixture<EditSensorNameComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, MatInputModule, BrowserAnimationsModule],
			declarations: [EditSensorNameComponent, AnsynInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditSensorNameComponent);
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
