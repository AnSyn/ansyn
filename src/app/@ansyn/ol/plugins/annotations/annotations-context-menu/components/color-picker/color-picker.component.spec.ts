import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { mockStayInImageryService } from '../../../../../../imagery/stay-in-imagery-service/stay-in-imagery.service.mock';

describe('ColorPickerComponent', () => {
	let component: ColorPickerComponent;
	let fixture: ComponentFixture<ColorPickerComponent>;

	const myComponent = ColorPickerComponent;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ColorPickerComponent],
			imports: [ColorPickerModule]
		})
			.overrideComponent(myComponent, {
				set: {
					providers: [mockStayInImageryService]
				}
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ColorPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
