import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { StayInImageryService } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-color-picker',
	templateUrl: './color-picker.component.html',
	styleUrls: ['./color-picker.component.less'],
	providers: [StayInImageryService]
})
export class ColorPickerComponent implements AfterViewInit {
	id = UUID.UUID();
	@Input() color: string;
	@Output() colorChange = new EventEmitter();
	@Input() label: string;
	@Input() active: boolean;
	@Input() activeDisabled: boolean;
	@Input() canToggle = true;

	@Output() activeChange = new EventEmitter();

	constructor(
		protected myElement: ElementRef,
		protected stayInImageryService: StayInImageryService
	) {
	}

	ngAfterViewInit(): void {
		this.stayInImageryService.init(this.getElement.bind(this), this.timerCallback.bind(this));
	}

	getElement() {
		const elements = (this.myElement.nativeElement as Element).getElementsByClassName('color-picker');
		return elements && elements[0];
	}

	timerCallback() {
		const targetElement = this.getElement();
		if (targetElement) {
			(targetElement as HTMLElement).style.transform = `translate(-${ this.stayInImageryService.moveLeft }px, ${ this.stayInImageryService.moveDown }px)`;
		}
	}
}
