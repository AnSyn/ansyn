import { Component, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AutoSubscription } from 'auto-subscriptions';
import { debounceTime, tap } from 'rxjs/operators';
import { AnsynComboTableComponent } from '../ansyn-combo-table/ansyn-combo-table.component';

@Component({
  selector: 'ansyn-combo-table-option',
  templateUrl: './ansyn-combo-table-option.component.html',
  styleUrls: ['./ansyn-combo-table-option.component.less']
})
export class AnsynComboTableOptionComponent implements OnInit {

  get selected() {
		return this._parent.selected;
	}
	@Input() value;

	@HostBinding('class.disabled')
  @Input() disabled = false;
  
  @AutoSubscription
	selectedChanged$ = this._parent.injector.get(NgControl).valueChanges.pipe(
		debounceTime(1500),
		tap(selected => {
			if (selected) {
				if (selected === this.value) {
					this._parent.renderSelected = this.el.nativeElement.innerHTML;
				}
			} else {
				this._parent.renderSelected = '';
			}
    }));
    
  constructor(protected _parent: AnsynComboTableComponent, protected el: ElementRef) { }

  @HostListener('click') onClick() {
		if (this.value) {
			this._parent.selectOption(this.value);
		}
		// this._parent.close();
  }
  
  ngOnInit(): void {
  }

}
