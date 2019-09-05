import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { AnnotationsColorComponent } from './annotations-color.component';

describe('AnnotationsColorComponent', () => {
	let component: AnnotationsColorComponent;
	let fixture: ComponentFixture<AnnotationsColorComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnnotationsColorComponent,
				ColorPickerComponent
			],
			imports: [ColorPickerModule,
				TranslateModule.forRoot()],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsColorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
