import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

const animationsDuring = '0.5s';

const animations: any[] = [
	trigger('content', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, -100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }))])
	])
];

@Component({
	selector: 'ansyn-modal',
	templateUrl: './ansyn-modal.component.html',
	styleUrls: ['./ansyn-modal.component.less'],
	animations
})
export class AnsynModalComponent implements OnInit {
	@Input() @HostBinding('class.show') show: boolean;
	@Output() showChange = new EventEmitter<boolean>();

	constructor() {
	}

	ngOnInit() {
	}

}
