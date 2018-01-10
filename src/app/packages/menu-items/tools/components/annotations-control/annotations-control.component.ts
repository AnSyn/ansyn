import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeWhile';

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AnnotationVisualizerAgentAction, SetAnnotationMode } from '../../actions/tools.actions';
import { DOCUMENT } from '@angular/common';
import { AnnotationMode, IToolsState, toolsStateSelector } from '../../reducers/tools.reducer';

export interface ModeList {
	mode: AnnotationMode;
	icon: string;
}
export interface LineWidthList {
	width: number;
}


@Component({
	selector: 'ansyn-annotations-control',
	templateUrl: './annotations-control.component.html',
	styleUrls: ['./annotations-control.component.less']
})
export class AnnotationsControlComponent implements OnDestroy, OnInit {
	private _expand: boolean;
	public lineWidthTrigger: boolean;

	public lineWidthSelectionExpand: boolean;
	public colorSelectionExpand: boolean;


	public subscriber;
	public mode$: Observable<AnnotationMode> = this.store.select<IToolsState>(toolsStateSelector)
		.pluck<IToolsState, AnnotationMode>('annotationMode')
		.distinctUntilChanged();

	public mode: AnnotationMode;

	public selectedStrokeWidthIndex = 0;

	public selectedStrokeColor = '#27b2cfe6';
	public selectedFillColor = 'white';

	public modesList: ModeList[] = [
		{ mode: 'Point', icon: 'point' },
		{ mode: 'LineString', icon: 'line' },
		{ mode: 'Polygon', icon: 'polygon' },
		{ mode: 'Circle', icon: 'circle' },
		{ mode: 'Rectangle', icon: 'square' },
		{ mode: 'Arrow', icon: 'arrow' }
	];

	public lineWidthList: LineWidthList[] = [
		{ width: 1 },
		{ width: 2 },
		{ width: 3 },
		{ width: 4 },
		{ width: 5 },
		{ width: 6 },
		{ width: 7 }
	];

	@HostBinding('class.expand')
	@Input()
	set expand(value) {
		if (!value) {
			this.lineWidthSelectionExpand = false;
			this.colorSelectionExpand = false;
		}
		this._expand = value;
	}

	get expand() {
		return this._expand;
	}

	get selectedStrokeWidth() {
		return this.lineWidthList[this.selectedStrokeWidthIndex];
	}

	constructor(public store: Store<any>, @Inject(DOCUMENT) public document: any) {
	}

	ngOnInit() {
		this.mode$.subscribe(value => this.mode = value);
	}

	toggleLineWidthSelection() {
		this.colorSelectionExpand = false;
		this.lineWidthSelectionExpand = !this.lineWidthSelectionExpand;
	}

	toggleColorSelection() {
		this.lineWidthSelectionExpand = false;
		this.colorSelectionExpand = !this.colorSelectionExpand;
	}

	createInteraction(mode: AnnotationMode) {

		this.store.dispatch(new AnnotationVisualizerAgentAction({
			operation: 'toggleDrawInteraction',
			mode,
			relevantMaps: 'active'
		}));

		this.store.dispatch(new SetAnnotationMode(this.mode === mode ? undefined : mode));
	}

	openColorInput($event) {

		let element = $event.target.closest('li');
		if (!element) {
			element = $event.target;
		}
		element.getElementsByTagName('input')[0].click();
	}

	selectLineWidth(index) {
		this.selectedStrokeWidthIndex = index;

		this.store.dispatch(new AnnotationVisualizerAgentAction({
			operation: 'changeLine',
			value: this.selectedStrokeWidth.width,
			relevantMaps: 'active'
		}));

	}

	changeStrokeColor() {
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			operation: 'changeStrokeColor',
			value: this.selectedStrokeColor,
			relevantMaps: 'active'
		}));
	}

	changeFillColor() {
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			operation: 'changeFillColor',
			value: this.selectedFillColor,
			relevantMaps: 'active'
		}));
	}

	ngOnDestroy() {
		if (this.subscriber) {
			this.subscriber.unsubscribe();
		}
	}

}
