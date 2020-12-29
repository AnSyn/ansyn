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
	@ViewChild('optionsContainer') optionsContainer: ElementRef;
	@Input() icon: string;
	disabled: boolean;
	@Input() selected: any[];
	@Input() comboTableToolTipDescription: string;
	@Input() direction: 'top' | 'bottom' = 'bottom';
  @Input() buttonClass: string;
  @Input() isLine: boolean;
  @Input() contentTitle: string;
  @Input() isFullSize: boolean;
  
	@Input() required: boolean;
	optionsVisible = true;
  
  @Output() selectedItemsArray = new EventEmitter<any[]>();
  
  constructor(public injector: Injector) { }

  selectOption(selected) {
		if (this.selected.includes(selected)) {
      const newSelectedArray = [];
      this.selected.forEach(item => {
        if (item !== selected) {
          newSelectedArray.push(item);
        }
      });
      this.selected = newSelectedArray;
    } else {
        this.selected = [...this.selected, selected];
    }
    this.selectedItemsArray.emit(this.selected);
  }

  selectAllOptions(allOptionsArray: any[]) {
    this.selected = allOptionsArray.slice();
    this.selectedItemsArray.emit(this.selected);
  }

  resetSelection() {
    this.selected = [];
    this.selectedItemsArray.emit(this.selected);
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
