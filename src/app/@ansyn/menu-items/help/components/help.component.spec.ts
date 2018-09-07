import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpComponent } from './help.component';
import { By } from '@angular/platform-browser';
import { AnsynCheckboxComponent } from '@ansyn/core/components/ansyn-checkbox/ansyn-checkbox.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { HelpLocalStorageService } from '../services/help.local-storage.service';

describe('HelpComponent', () => {
	let component: HelpComponent;
	let fixture: ComponentFixture<HelpComponent>;

	const mockCarousel = MockComponent({ selector: 'carousel', inputs: ['interval'] });
	const mockSlide = MockComponent({ selector: 'slide' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [HelpComponent,
				AnsynCheckboxComponent,
				mockCarousel,
				mockSlide
			],
			providers: [
				{
					provide: HelpLocalStorageService, useValue: {
						setHelpLocalStorageData: () => {},
						getHelpLocalStorageData: () => ({})
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HelpComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('checkbox click event', () => {
		it('should invoke a call to the store', () => {
			let checkboxElement = fixture.debugElement.query(By.directive(AnsynCheckboxComponent));
			spyOn(component.helpLocalStorageService, 'setHelpLocalStorageData');
			checkboxElement.triggerEventHandler('checkedChange', true );
			expect(component.helpLocalStorageService.setHelpLocalStorageData).toHaveBeenCalledWith({ dontShowHelpOnStartup: true });
		});
	});
});
