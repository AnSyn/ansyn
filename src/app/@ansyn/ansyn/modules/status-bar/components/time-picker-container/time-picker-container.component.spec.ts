import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TimePickerContainerComponent } from './time-picker-container.component';
import { StoreModule } from '@ngrx/store';
import { StatusBarConfig } from '../../models/statusBar.config';
import { TranslateModule } from '@ngx-translate/core';

describe('TimePickerContainerComponent', () => {
	let component: TimePickerContainerComponent;
	let fixture: ComponentFixture<TimePickerContainerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [TimePickerContainerComponent],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot()],
			providers: [
				{ provide: StatusBarConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimePickerContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
