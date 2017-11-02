import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppAnsynComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import '@ansyn/core/utils/clone-deep';

describe('AppAnsynComponent', () => {
	let fixture: ComponentFixture<AppAnsynComponent>;
	let appComponent: AppAnsynComponent;
	let element: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [AppAnsynComponent]
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
