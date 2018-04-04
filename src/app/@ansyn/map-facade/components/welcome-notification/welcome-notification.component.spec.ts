import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeNotificationComponent } from './welcome-notification.component';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';

fdescribe('WelcomeNotificationComponent', () => {
	let component: WelcomeNotificationComponent;
	let fixture: ComponentFixture<WelcomeNotificationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer })],
			declarations: [WelcomeNotificationComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(WelcomeNotificationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('tabindex attribute should return zero', () => {
		expect(component.tabindex).toEqual(0);
	});

});
