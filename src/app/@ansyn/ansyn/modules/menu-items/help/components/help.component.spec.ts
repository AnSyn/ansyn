import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpComponent } from './help.component';
import { By } from '@angular/platform-browser';
import { AnsynCheckboxComponent, MockComponent } from '../../../core/public_api';
import { HelpLocalStorageService } from '../services/help.local-storage.service';
import { FormsModule } from '@angular/forms';

describe('HelpComponent', () => {
	let component: HelpComponent;
	let fixture: ComponentFixture<HelpComponent>;

	const mockCarousel = MockComponent({ selector: 'carousel', inputs: ['interval'] });
	const mockSlide = MockComponent({ selector: 'slide' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [HelpComponent,
				AnsynCheckboxComponent,
				mockCarousel,
				mockSlide
			],
			providers: [
				{
					provide: HelpLocalStorageService, useValue: {
						setHelpLocalStorageData: () => {
						},
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
			checkboxElement.triggerEventHandler('ngModelChange', true);
			expect(component.helpLocalStorageService.setHelpLocalStorageData).toHaveBeenCalledWith({ dontShowHelpOnStartup: true });
		});
	});
});
