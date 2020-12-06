import { Component, ElementRef, EventEmitter, forwardRef, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

@Component({
  selector: 'ansyn-combo-table',
  templateUrl: './ansyn-combo-table.component.html',
  styleUrls: ['./ansyn-combo-table.component.less'],
  providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AnsynComboTableComponent),
			multi: true
		}
	]
})
export class AnsynComboTableComponent implements ControlValueAccessor {

  onTouchedCallback: () => void = noop;
  onChangeCallback: (_: any) => void = noop;
	// @ViewChild(AnsynComboTableComponent) trigger: AnsynComboTableComponent;
	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@Input() icon: string;
	disabled: boolean;
	selected: any[] = [];
	@Input() comboTableToolTipDescription: string;
	@Input() direction: 'top' | 'bottom' = 'bottom';
	@Input() withArrow = true;
	@Input() alwaysChange: boolean;
  @Input() buttonClass: string;
  @Input() isLine: boolean;
  @Input() contentTitle: string;
  
	@Input() placeholder: string;
	@Input() required: boolean;
	optionsVisible = true;
	renderSelected = '';
  
  @Output() selectedItemsArray = new EventEmitter<any[]>();
  // get optionsTrigger(): ElementRef {
	// 	return this.trigger && this.trigger.optionsTrigger;
  // }
  
  constructor(public injector: Injector) { }

  toggleShow() {
		this.optionsVisible = !this.optionsVisible;
		if (this.optionsVisible) {
			setTimeout(() => this.optionsContainer && this.optionsContainer.nativeElement.focus(), 0);
		}
  }

  selectOption(selected) {
		if (this.selected.includes(selected)) {
			this.selected.splice(this.selected.indexOf(selected),1);
    } else {
      this.selected.push(selected);
    }
    this.selectedItemsArray.emit(this.selected)
  }

  selectAllOptions(allOptionsArray: any[]) {
    console.log(this.contentTitle)
    this.selected = allOptionsArray.slice();
    this.selectedItemsArray.emit(this.selected)
  }

  close() {
		this.optionsVisible = false;
	}

  registerOnChange(fn: any): void {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouchedCallback = fn;
  }
  
  writeValue(value: any): void {
		if (!this.selected.includes(value)) {
			this.selected.push(value);
    }
  }

  
}
