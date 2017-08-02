import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { GoToComponent } from './go-to.component';
import { toolsConfig } from '../../services/tools.service';
import { Store, StoreModule } from '@ngrx/store';
import { IToolsState, ToolsReducer } from '../../reducers/tools.reducer';
import { GoToModule } from '../go-to.module';
import { GoToAction } from '../../actions/tools.actions';

describe('GoToComponent', () => {
	let component: GoToComponent;
	let fixture: ComponentFixture<GoToComponent>;
	let store: Store<IToolsState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [GoToModule, StoreModule.provideStore({tools: ToolsReducer})],
			providers: [
				{provide: toolsConfig, useValue: {
					GoTo: {
						from: '',
						to: ''
					}
				}},
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store <IToolsState>) => {
		store = _store;
		fixture = TestBed.createComponent(GoToComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('set expand should change _expand value and call expandChange.emit', () => {
		spyOn(component.expandChange, 'emit');
		component.expand = true;
		expect(component.expandChange.emit).toHaveBeenCalledWith(true);
		expect((<any>component)._expand).toBeTruthy();
		component.expand = false;
		expect(component.expandChange.emit).toHaveBeenCalledWith(false);
		expect((<any>component)._expand).toBeFalsy();
	});

	describe('submitGoTo', () => {

		it('should dispatch  GoToAction with activeCenter', () => {
			spyOn(store, 'dispatch');
			component.submitGoTo();
			expect(store.dispatch).toHaveBeenCalledWith(new GoToAction(component.activeCenter));
		});

		it('"submit" button should call submitGoTo', () => {
			spyOn(component, 'submitGoTo');
			const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
			submitBtn.click();
			fixture.detectChanges();
			expect(component.submitGoTo).toHaveBeenCalled();
		});

	});

});
