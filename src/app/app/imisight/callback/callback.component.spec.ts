import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CallbackComponent } from './callback.component';
import { MockComponent } from '@ansyn/ansyn';

describe('CallbackComponent', () => {
	let component: CallbackComponent;
	let fixture: ComponentFixture<CallbackComponent>;
	const mockLoader = MockComponent({ selector: 'ansyn-loader', inputs: ['show', 'loaderText'] });


	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [CallbackComponent, mockLoader]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CallbackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
