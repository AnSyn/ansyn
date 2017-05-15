import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import { AppComponent } from './app.component';
import {AppModule} from "./app.module";
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let appComponent: AppComponent;
	let element: any;


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports:[RouterTestingModule],
			declarations:[AppComponent]
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
