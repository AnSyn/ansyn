import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UnsupportedDevicesComponent } from '../@ansyn/ansyn/components/unsupported-devices/unsupported-devices.component';
import { AppAnsynComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DeviceDetectorModule } from 'ngx-device-detector';

describe('AppAnsynComponent', () => {
	let fixture: ComponentFixture<AppAnsynComponent>;
	let appComponent: AppAnsynComponent;
	let element: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule,
				DeviceDetectorModule.forRoot()],
			declarations: [AppAnsynComponent, UnsupportedDevicesComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AppAnsynComponent);
		appComponent = fixture.debugElement.componentInstance;
		element = fixture.debugElement.nativeElement;
	});

	it('should create the app', async(() => {
		expect(appComponent).toBeTruthy();
	}));

});
