import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageProcessingControlComponent } from './image-processing-control.component';
import { MockPipe } from '../../../../core/test/mock-pipe';
import { MockComponent } from '../../../../core/test/mock-component';
import { StoreModule } from '@ngrx/store';
import { overlayStatusConfig } from '../../config/overlay-status-config';

const mockInputRange = MockComponent({
	selector: 'input[input_range]',
	inputs: ['ngModel'],
	outputs: ['ngModelChange']
});

describe('ImageProcessingControlComponent', () => {
	let component: ImageProcessingControlComponent;
	let fixture: ComponentFixture<ImageProcessingControlComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			declarations: [
				ImageProcessingControlComponent,
				MockPipe('translate'),
				mockInputRange
			],
			providers: [
				{
					provide: overlayStatusConfig,
					useValue: {
						ImageProcParams: []
					} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageProcessingControlComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
