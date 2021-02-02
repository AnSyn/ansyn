import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AnnotationSetProperties, ClearActiveInteractionsAction, SetAnnotationMode } from '../../actions/tools.actions';
import { DOCUMENT } from '@angular/common';
import { selectAnnotationMode, selectAnnotationProperties } from '../../reducers/tools.reducer';
import { getOpacityFromColor, IVisualizerStyle } from '@ansyn/imagery';
import { filter, map, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ANNOTATION_MODE_LIST, AnnotationMode, IStyleWeight } from '@ansyn/ol';
import {
	selectActiveAnnotationLayer,
	selectLayers
} from '../../../../../menu-items/layers-manager/reducers/layers.reducer';
import { ILayer, LayerType } from '../../../../../menu-items/layers-manager/models/layers.model';
import { ClickOutsideService } from '../../../../../core/click-outside/click-outside.service';
import { SetActiveAnnotationLayer } from '../../../../../menu-items/layers-manager/actions/layers.actions';
import { selectIsMinimalistViewMode } from '@ansyn/map-facade';

export enum SelectionBoxTypes {
	None,
	LineWidth,
	ColorPicker
}

@Component({
	selector: 'ansyn-annotations-control',
	templateUrl: './annotations-control.component.html',
	styleUrls: ['./annotations-control.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class AnnotationsControlComponent implements OnInit, OnDestroy {

	get SelectionBoxTypes() {
		return SelectionBoxTypes;
	}

	get Boolean() {
		return Boolean;
	}

	@HostBinding('class.expand')
	@Input()
	set expand(value) {
		if (!value) {
			this.selectedBox = SelectionBoxTypes.None;
		}
		this._expand = value;
	}

	get expand() {
		return this._expand;
	}
	@Input() isGeoOptionsDisabled: boolean;
	@Output() hideMe = new EventEmitter<boolean>();

	fillAlpah = 0.4;
	strokeAlpah = 1;
	activeAnnotationId: string;

	private _expand: boolean;
	public selectedBox: SelectionBoxTypes;

	annotationLayer$ = this.store.pipe(
		select(selectLayers),
		map((layers: ILayer[]) => layers.filter(({ type }) => type === LayerType.annotation))
	);

	@AutoSubscription
	activeAnnotationLayer$ = this.store.pipe(
		select(selectActiveAnnotationLayer),
		filter((layerId) => Boolean(layerId)),
		tap((layerId) => {
			this.activeAnnotationId = layerId;
		})
	);

	@AutoSubscription
	mode$: Observable<AnnotationMode> = this.store.pipe(
		select(selectAnnotationMode),
		tap(mode => this.mode = mode)
	);

	@AutoSubscription
	annotationProperties$: Observable<Partial<IVisualizerStyle>> = this.store.pipe(
		select(selectAnnotationProperties),
		tap(annotationProperties => this.annotationProperties = annotationProperties)
	);

	@AutoSubscription
	hideAnnotaionMenu$: Observable<boolean> = this.store.select(selectIsMinimalistViewMode).pipe(
		tap(() => this.store.dispatch(new SetAnnotationMode(null)))
	);

	public mode: AnnotationMode;
	public annotationProperties: Partial<IVisualizerStyle>;

	public ANNOTATION_MODE_LIST = ANNOTATION_MODE_LIST;

	@AutoSubscription
	onClickOutside$ = this.clickOutsideService.onClickOutside({monitor: this.element.nativeElement}).pipe(
		filter((isClickOutside) => isClickOutside && this.expand),
		tap(() => {
			this.hideMe.emit();
		})
	);

	constructor(
		protected element: ElementRef,
		public store: Store<any>,
		protected clickOutsideService: ClickOutsideService,
		@Inject(DOCUMENT) public document: any
	) {
	}

	@AutoSubscription
	clickOutsideColorOrWeight = () => fromEvent(this.document, 'click')
		.pipe(
			filter((event: any) => this.selectedBox !== SelectionBoxTypes.None),
			filter(({ path }) => !path.some(comp =>
				['ansyn-annotations-color', 'ansyn-annotations-weight'].includes(comp.localName) ||
				['icon-annotation-weight', 'icon-annotation-color'].includes(comp.className)
				)
			),
			tap(_ => this.toggleSelection())
		);

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	setSelectedAnnotationLayer(id) {
		this.store.dispatch(new SetActiveAnnotationLayer(id));
	}

	toggleSelection(selected: SelectionBoxTypes = SelectionBoxTypes.None) {
		this.selectedBox = this.selectedBox === selected ? SelectionBoxTypes.None : selected;
	}

	setAnnotationMode(mode?: AnnotationMode) {
		const dispatchValue = this.mode === mode ? undefined : mode;
		if (dispatchValue) {
			this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetAnnotationMode] }));
			this.store.dispatch(new SetAnnotationMode({ annotationMode: dispatchValue }));
			this.hideMe.emit();
		} else {
			this.store.dispatch(new SetAnnotationMode(null));
		}
	}

	selectLineStyle(style: IStyleWeight) {
		this.store.dispatch(new AnnotationSetProperties({
			'stroke-width': style.width,
			'stroke-dasharray': style.dash
		}));
	}

	activeChange($event) {
		if ($event.label === 'fill') {
			this.store.dispatch(new AnnotationSetProperties({ 'fill-opacity': $event.event ? this.fillAlpah : 0 }));
		} else {
			this.store.dispatch(new AnnotationSetProperties({ 'stroke-opacity': $event.event ? this.strokeAlpah : 0 }));

		}
	}

	colorChange(changesArray: Array<any>) {
		const style = {};

		changesArray.forEach((colorData) => {
			style[colorData.label] = colorData.event;

			let opacityProp: string;
			switch (colorData.label) {
				case 'fill':
					opacityProp = 'fill-opacity';
					break;
				case 'stroke':
					opacityProp = 'stroke-opacity';
					break;
				default:
					opacityProp = null;
			}

			if (opacityProp) {
				style[opacityProp] = getOpacityFromColor(colorData.event);
			}
		});
		this.store.dispatch(new AnnotationSetProperties(style));
	}

	isAnnotationEnable(annotation) {
		return !([AnnotationMode.LineString, AnnotationMode.Arrow].includes(annotation) && !this.annotationProperties['stroke-opacity']);

	}

	isActive(annotationMode) {
		return annotationMode !== AnnotationMode.Translate && this.mode === annotationMode;
	}
}
