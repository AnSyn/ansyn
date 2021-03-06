import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColorPickerComponent } from './color-picker.component';
import { mockStayInImageryService } from '../../../../../../imagery/stay-in-imagery-service/stay-in-imagery.service.mock';
import { MockPipe } from '../../../../../../ansyn/modules/core/test/mock-pipe';
import { MockComponent } from '../../../../../../ansyn/modules/core/test/mock-component';

const mockColorPickerTrigger = MockComponent({
	selector: 'input[colorPickerInput]',
	inputs: ['colorPicker'],
	outputs: ['colorPickerChange']
});

describe('ColorPickerComponent', () => {
	let component: ColorPickerComponent;
	let fixture: ComponentFixture<ColorPickerComponent>;

	const myComponent = ColorPickerComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [
				ColorPickerComponent,
				mockColorPickerTrigger,
				MockPipe('translate')
			]
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
