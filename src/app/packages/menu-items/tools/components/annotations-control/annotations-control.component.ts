import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeWhile';

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AnnotationVisualizerAgentAction } from '../../actions/tools.actions';


@Component({
	selector: 'ansyn-annotations-control',
	templateUrl: './annotations-control.component.html',
	styleUrls: ['./annotations-control.component.less']
})
export class AnnotationsControlComponent implements  OnDestroy {
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

	constructor(public renderer: Renderer2,public store: Store<any> ) {
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
		this.colorSelection.nativeElement.classList.toggle('open')

		if(this.colorSelectionTrigger){
				this.clickOutside();
		}
		else {
			this.subscriber && this.subscriber.unsubscribe();
		}
		//}
	}

	clickOutside(){
		this.subscriber = Observable.fromEvent(document,'click')
			.subscribe( (event: any) => {

				if(!event.target.closest(".expanded-selection.color-selection")){
					this.colorSelectionTrigger = false;
					this.colorSelection.nativeElement.classList.remove('open')
					this.subscriber.unsubscribe();
				}
			});
	}

	testVisualizer(type){
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: "createInteraction",
			type,
			maps: "active"
		}));
	}

	openMe($event) {
		let element = $event.target.closest('li');
		if(!element){
			element = $event.target;
		}
		element.getElementsByTagName('input')[0].click();
	}

	selectLineWidth($event){
		const lineWidth = $event.target.dataset.index;
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: "changeLine",
			value: lineWidth,
			maps: "active"
		}));

	}

	changeStrokeColor() {
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: "changeStrokeColor",
			value: this.colorOptionsStroke,
			maps: 'active'
		}));
	}

	changeFillColor() {
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: "changeFillColor",
			value: this.colorOptionsFill,
			maps: 'active'
		}));
	}

	ngOnDestroy(){
		this.subscriber && this.subscriber.unsubscribe();
	}

}
