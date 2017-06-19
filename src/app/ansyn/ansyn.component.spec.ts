import { AppRouter } from '../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { StoreModule } from '@ngrx/store';
import { APP_BASE_HREF } from '@angular/common'
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;

	const mock_menu = MockComponent({selector: 'ansyn-menu'});
	const mock_status = MockComponent({selector: 'ansyn-status-bar', inputs: ['selected_case_name', 'overlays_count', 'overlay-name', 'hide-overlay-name']});
	const mock_overlays_container = MockComponent({selector: 'overlays-container'});
	const mock_imagery_view = MockComponent({selector: 'ansyn-imageries-manager', inputs: ['selected_layout', 'maps']});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynComponent, mock_menu, mock_overlays_container, mock_status, mock_imagery_view],
			imports: [StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer, overlays : OverlayReducer}),AppRouter],
			providers: [{provide: APP_BASE_HREF, useValue: '/'}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
