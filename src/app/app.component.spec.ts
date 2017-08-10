import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import { AppComponent } from './app.component';
import {AppModule} from "./app.module";
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { StoreModule } from '@ngrx/store';
import { StatusBarReducer } from './packages/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from './packages/menu-items/cases/reducers/cases.reducer';
import { OverlayReducer } from './packages/overlays/reducers/overlays.reducer';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let appComponent: AppComponent;
	let element: any;

	const mock_menu = MockComponent({selector: 'ansyn-menu'});
	const mock_status = MockComponent({selector: 'ansyn-status-bar', inputs: ['selected_case_name', 'overlays_count', 'overlay', 'hide-overlay']});
	const mock_overlays_container = MockComponent({selector: 'ansyn-overlays-container'});
	const mock_imagery_view = MockComponent({selector: 'ansyn-imageries-manager', inputs: ['selected_layout', 'maps']});
	const mock_empty_component = MockComponent({selector: 'ansyn-empty'});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports:[
				RouterTestingModule,
				StoreModule.provideStore({
					status_bar: StatusBarReducer,
					cases: CasesReducer,
					overlays : OverlayReducer
				})
			],
			declarations:[
				AppComponent,
				mock_menu,
				mock_overlays_container,
				mock_status,
				mock_imagery_view,
				mock_empty_component

			]
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
