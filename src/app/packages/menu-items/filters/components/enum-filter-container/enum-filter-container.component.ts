import { EnumFilterMetadata } from './../../models/metadata/enum-filter-metadata';
import { Filter } from './../../models/filter';
import { Component, Input, ElementRef, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ansyn-enum-filter-container',
  templateUrl: './enum-filter-container.component.html',
  styleUrls: ['./enum-filter-container.component.less']
})
export class EnumFilterContainerComponent {

  @Input() metadata: EnumFilterMetadata;

  constructor(private myElement: ElementRef) { }

  updateCheckbox(id: string, newValue: boolean) {
    const inputElement: HTMLInputElement = this.myElement.nativeElement.querySelector(`input[id="checkbox${id}"]`);
    if (newValue) {
      inputElement.setAttribute("checked", "checked");
    } else {
      inputElement.removeAttribute("checked");
    }
  }

}
