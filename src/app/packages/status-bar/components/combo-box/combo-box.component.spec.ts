import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboBoxComponent } from './combo-box.component';

describe('ComboBoxComponent', () => {
  let component: ComboBoxComponent;
  let fixture: ComponentFixture<ComboBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

	it('should set selectIndex change value of _selectedIndex and call selectedIndexChange.emit with the new value', () => {
		spyOn(component.selectedIndexChange, 'emit');
		(<any>component)._selectedIndex = 0;
		component.selectedIndex = 6;
		expect(component.selectedIndexChange.emit).toHaveBeenCalledWith(6);
		expect((<any>component)._selectedIndex).toEqual(6)
	});

	it('toggleShow should toggle "visibility" of optionsContainer("visible" and "hidden"). on "visible" focus() should have been call too', () => {
		const optionsContainerStyle: CSSStyleDeclaration = component.optionsContainer.nativeElement.style;
		spyOn(component.optionsContainer.nativeElement, 'focus');
		optionsContainerStyle.visibility = 'hidden';
		component.toggleShow();
		expect(optionsContainerStyle.visibility).toEqual('visible');
		expect(component.optionsContainer.nativeElement.focus).toHaveBeenCalled();
		optionsContainerStyle.visibility = 'visible';
		component.toggleShow();
		expect(optionsContainerStyle.visibility).toEqual('hidden');
	});

	describe('onBlurOptionsContainer change "visibility" of optionsContainer to "hidden". only if relatedTarget is not "trigger" button', () => {
		it('not "trigger" button', () => {
			const $event = {
				relatedTarget: {}
			} as any;
			const optionsContainerStyle: CSSStyleDeclaration = component.optionsContainer.nativeElement.style;
			optionsContainerStyle.visibility = 'visible';
			component.onBlurOptionsContainer($event);
			expect(optionsContainerStyle.visibility).toEqual('hidden');
		});

		it('"trigger" button', () => {
			const $event: FocusEvent = {
				relatedTarget: component.optionsTrigger.nativeElement
			} as any;
			const optionsContainerStyle: CSSStyleDeclaration = component.optionsContainer.nativeElement.style;
			optionsContainerStyle.visibility = 'visible';
			component.onBlurOptionsContainer($event);
			expect(optionsContainerStyle.visibility).toEqual('visible');
		});
	});

	it('selectOption should get index, set the index on selectedIndex and change "visibility" of optionsContainer to "hidden".', () => {
		component.selectOption(20);
		expect(component.selectedIndex).toEqual(20);
		expect(component.optionsContainer.nativeElement.style.visibility).toEqual('hidden');
	});

});
