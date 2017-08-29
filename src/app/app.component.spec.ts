import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import '@ansyn/core/utils/clone-deep';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let appComponent: AppComponent;
	let element: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [AppComponent]
		}).compileComponents();
	}));

	beforeEach(()=>{
		fixture = TestBed.createComponent(AppComponent);
		appComponent = fixture.debugElement.componentInstance;
		element = fixture.debugElement.nativeElement;
	});

	it('should create the app', async(() => {
		expect(appComponent).toBeTruthy();
	}));

});
