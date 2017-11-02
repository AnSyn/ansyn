import { SliderFilterMetadata } from './../../models/metadata/slider-filter-metadata';
import { Component, Input, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ansyn-slider-filter-container',
  templateUrl: './slider-filter-container.component.html',
  styleUrls: ['./slider-filter-container.component.less']
})
export class SliderFilterContainerComponent {

  factor = 1000;
  _metadata: SliderFilterMetadata;

  @Input() set metadata(value: SliderFilterMetadata) {
    this._metadata = value;
    this.rangeValues = [this.factor * value.start, this.factor * value.end];
  }

  get metadata(): SliderFilterMetadata {
    return this._metadata;
  }

  @Output() onMetadataChange = new EventEmitter<SliderFilterMetadata>();
  rangeValues: number[];

  constructor(private myElement: ElementRef) { }

  handleChange(event) {
    const clonedMetadata: SliderFilterMetadata = Object.assign(Object.create(this.metadata), this.metadata);
    clonedMetadata.updateMetadata({ start: event.values[0] / this.factor, end: event.values[1] / this.factor });

    this.onMetadataChange.emit(clonedMetadata);
  }
}
