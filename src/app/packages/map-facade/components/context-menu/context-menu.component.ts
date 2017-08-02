import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { MapFacadeService } from '../../services/map-facade.service';
import { MapEffects } from '../../effects/map.effects';
import { MapContextMenuAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent {
	private _visibility;

	@HostBinding('style.visibility') @Input() set visibility(value) {
		this.visibilityChange.emit(value);
		this._visibility = value;
	}

	get visibility() {
		return this._visibility;
	}

	@HostListener('click', ['$event']) onClick($event) {
		$event.stopPropagation();
		this.visibility = 'hidden';
	}

	get contextMenuStyle() {
		console.log({
			top: this.top,
			left: this.left
		});
		return {
			top: this.top,
			left: this.left
		}
	}


	constructor(private mapEffects: MapEffects) { }


	@Output() visibilityChange = new EventEmitter();

	@Input() top = `0px`;
	@Input() left = `0px`;



}
