import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { AnnotationsColorComponent } from './annotations-color.component';
import { mockStayInImageryService } from '../../../../../../imagery/stay-in-imagery-service/stay-in-imagery.service.mock';

describe('AnnotationsColorComponent', () => {
	let component: AnnotationsColorComponent;
	let fixture: ComponentFixture<AnnotationsColorComponent>;

	const myComponent = AnnotationsColorComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnnotationsColorComponent,
				ColorPickerComponent
			],
			imports: [ColorPickerModule,
				TranslateModule.forRoot()],
		})
			.overrideComponent(myComponent, {
				set: {
					providers: [mockStayInImageryService]
				}
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
