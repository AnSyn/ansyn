import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeWhile';

import { Observable } from 'rxjs/Observable';


@Component({
	selector: 'ansyn-annotations-control',
	templateUrl: './annotations-control.component.html',
	styleUrls: ['./annotations-control.component.less']
})
export class AnnotationsControlComponent implements OnInit, OnDestroy {
	private _isExpended: boolean;
	public lineWidthTrigger: boolean;
	public colorSelectionTrigger = false;
	public colorOptionsFill: any;
	public colorOptionsStroke: any;
	public subscriber;

	@ViewChild('lineWidthSelection') lineWidthSelection: ElementRef;
	@ViewChild('colorSelection') colorSelection: ElementRef;
	@HostBinding('class.expand')
	@Input()
	set expand(value){
		this._isExpended = value;
	}

	get expand(){
		return this._isExpended;
	}

	constructor(public renderer: Renderer2) {
		console.log('x');

	}

	openLineWidthSelection($event){
		if(this.lineWidthTrigger){
			this.lineWidthTrigger = false;
			return;
		}
		if(document.activeElement !== this.lineWidthSelection.nativeElement){
			this.lineWidthSelection.nativeElement.focus();
		}
	}

	closeLineWidthSelection($event){
		if(document.activeElement === this.lineWidthSelection.nativeElement){
			this.lineWidthTrigger = true;
			this.lineWidthSelection.nativeElement.blur();
		}
	}

	toggleColorSelection($event){
		$event.stopPropagation();
		this.colorSelectionTrigger = !this.colorSelectionTrigger;
		//if(document.activeElement !== this.colorSelection.nativeElement){
			this.colorSelection.nativeElement.classList.toggle('open')
		if(this.colorSelectionTrigger){
				this.addEvent();
		}else {
			this.subscriber && this.subscriber.unsubscribe();
		}
		//}
	}

	addEvent(){
		this.subscriber = Observable.fromEvent(document,'click')
			.subscribe( (event: any) => {
				console.log('event document click',event.target);
				if(!event.target.closest(".expanded-selection.color-selection")){
					this.toggleColorSelection(event);
					this.subscriber.unsubscribe();
				}
			});
	}

	closeColorSelection(){
		if(document.activeElement === this.colorSelection.nativeElement){
			this.colorSelectionTrigger = true;
			this.colorSelection.nativeElement.blur();
		}
	}

	openMe($event) {

		let element = $event.target.closest('li');
		if(!element){
			element = $event.target;
		}
		element.getElementsByTagName('input')[0].click();
	}

	clickOutside(){

	}

	selectLineWidth($event){
		const lineWidth = $event.target.dataset.index;
	}

	ngOnInit() {
	}

	ngOnDestroy(){
		this.subscriber && this.subscriber.unsubscribe();
	}

}
