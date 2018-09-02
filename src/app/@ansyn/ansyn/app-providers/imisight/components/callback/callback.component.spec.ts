import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CallbackComponent } from './callback.component';
import { MockComponent } from '@ansyn/core/test/mock-component';

describe('CallbackComponent', () => {
	let component: CallbackComponent;
	let fixture: ComponentFixture<CallbackComponent>;
	const mockLoader = MockComponent({ selector: 'ansyn-loader', inputs: ['show', 'loaderText'] });


	beforeEach(async(() => {
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
