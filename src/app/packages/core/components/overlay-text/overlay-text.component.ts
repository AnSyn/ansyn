import { Component, Input } from '@angular/core';

@Component({
  selector: 'ansyn-overlay-text',
  templateUrl: './overlay-text.component.html',
  styleUrls: ['./overlay-text.component.less']
})
export class OverlayTextComponent {
	@Input() overlay;
}
