import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { ToolsReducer } from '../packages/menu-items/tools/reducers/tools.reducer';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;

	const mock_imagery_view = MockComponent({selector: 'ansyn-imageries-manager', inputs: ['selected_layout', 'maps', 'pin-location']});


	beforeEach(() => {

		TestBed.configureTestingModule({
			declarations: [
				AnsynComponent,
				mock_imagery_view,

			],
			imports: [
				RouterTestingModule,
				StoreModule.provideStore({
					status_bar: StatusBarReducer,
					cases: CasesReducer,
					overlays : OverlayReducer,
					tools: ToolsReducer
				})]
		})
			.compileComponents();
	});

	beforeEach(() => {

		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
