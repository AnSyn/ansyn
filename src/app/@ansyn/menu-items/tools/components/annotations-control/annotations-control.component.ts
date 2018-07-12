import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeWhile';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
	AnnotationSetProperties,
	SetAnnotationMode
} from '../../actions/tools.actions';
import { DOCUMENT } from '@angular/common';
import { IAnnotationProperties, IToolsState, toolsStateSelector } from '../../reducers/tools.reducer';
import { AnnotationMode } from '@ansyn/core/models/visualizers/annotations.model';
import { ClearActiveInteractionsAction } from '@ansyn/core/actions/core.actions';

export interface IModeList {
	mode: AnnotationMode;
	icon: string;
}

export type SelectionBoxTypes = 'lineWidth' | 'colorPicker' | undefined;

@Component({
	selector: 'ansyn-annotations-control',
	templateUrl: './annotations-control.component.html',
	styleUrls: ['./annotations-control.component.less']
})
export class AnnotationsControlComponent implements OnInit {
	private _expand: boolean;
	SelectionBoxes: {[key: string]: SelectionBoxTypes} = { lineWidth: 'lineWidth', colorPicker: 'colorPicker' };
	public selectedBox: SelectionBoxTypes;

	public mode$: Observable<AnnotationMode> = this.store.select<IToolsState>(toolsStateSelector)
		.pluck<IToolsState, AnnotationMode>('annotationMode')
		.distinctUntilChanged();

	public annotationProperties$: Observable<IAnnotationProperties> = this.store.select<IToolsState>(toolsStateSelector)
		.pluck<IToolsState, IAnnotationProperties>('annotationProperties')
		.distinctUntilChanged();

	public mode: AnnotationMode;
	public annotationProperties: IAnnotationProperties;

	public modesList: IModeList[] = [
		{ mode: 'Point', icon: 'point' },
		{ mode: 'LineString', icon: 'line' },
		{ mode: 'Polygon', icon: 'polygon' },
		{ mode: 'Circle', icon: 'circle' },
		{ mode: 'Rectangle', icon: 'square' },
		{ mode: 'Arrow', icon: 'arrow' }
	];

	public lineWidthList = [1, 2, 3, 4, 5, 6, 7];

	@HostBinding('class.expand')
	@Input()
	set expand(value) {
		if (!value) {
			this.selectedBox = undefined;
		}
		this._expand = value;
	}

	get expand() {
		return this._expand;
	}

	constructor(public store: Store<any>, @Inject(DOCUMENT) public document: any) {
	}

	ngOnInit() {
		this.mode$.subscribe(value => this.mode = value);
		this.annotationProperties$.subscribe(value => this.annotationProperties = value);
	}

	toggleSelection(selected: SelectionBoxTypes) {
		this.selectedBox = this.selectedBox === selected ? undefined : selected;
	}

	setAnnotationMode(mode?: AnnotationMode) {
		const dispatchValue = this.mode === mode ? undefined : mode;
		if (dispatchValue) {
			this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetAnnotationMode]}));
		}
		this.store.dispatch(new SetAnnotationMode(dispatchValue));
	}

	selectLineWidth(strokeWidth: number) {
		this.store.dispatch(new AnnotationSetProperties({ strokeWidth }));
	}

	changeStrokeColor(strokeColor: string) {
		this.store.dispatch(new AnnotationSetProperties({ strokeColor }));
	}

	changeFillColor(fillColor: string) {
		this.store.dispatch(new AnnotationSetProperties({ fillColor }));
	}

}
