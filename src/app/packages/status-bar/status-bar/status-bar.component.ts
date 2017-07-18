import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, statusBarFlagsItems } from '../reducers/status-bar.reducer';
import {
	ChangeLayoutAction, SetLinkCopyToastValueAction, OpenShareLink, UpdateStatusFlagsAction,
	CopySelectedCaseLinkAction, FavoriteAction, ExpandAction, GoNextAction, GoPrevAction, BackToWorldViewAction,
	ToggleHistogramAction
} from '../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'lodash';
import { MapsLayout } from '@ansyn/core';





@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit {
	layouts$: Observable<MapsLayout[]> = this.store.select("status_bar")
		.map((state: IStatusBarState) => state.layouts)
		.distinctUntilChanged(isEqual);

	selectedLayoutIndex$: Observable<number> = this.store.select("status_bar")
		.map((state: IStatusBarState) => state.selected_layout_index)
		.distinctUntilChanged(isEqual);

	showLinkCopyToast$: Observable<boolean> = this.store.select('status_bar')
		.map((state: IStatusBarState) => state.showLinkCopyToast)
		.distinctUntilChanged(isEqual);

	flags$ = this.store.select('status_bar')
		.map( (state: IStatusBarState) => state.flags)
		.distinctUntilChanged(isEqual);


	selected_layout_index: number;
	statusBarFlagsItems: any = statusBarFlagsItems;
	flags: Map<string, boolean> = new Map<string, boolean>();
	layouts: MapsLayout[] = [];
	showLinkCopyToast: boolean;
	timeSelectionEditIcon = false;

	date1: Date;
	date2: Date;

	histogramActive = false;


	@Input() selected_case_name: string;
	@Input() overlays_count: number;
	@Input('overlay') overlay: any;
	@Input('hide-overlay') hideOverlay: boolean;
	@Input('maps') maps: any;
	@Output('toggleEditMode') toggleEditMode = new EventEmitter();

	@ViewChild('goPrev') goPrev: ElementRef;
	@ViewChild('goNext') goNext: ElementRef;



	@HostListener("window:keydown", ['$event'])

	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === "ArrowRight") {
			this.goNext.nativeElement.classList.add('active');
		}
		else if ($event.code === "ArrowLeft") {
			this.goPrev.nativeElement.classList.add('active');
		}
	}

	@HostListener("window:keyup", ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.code === "ArrowRight") {
			this.clickGoNext();
			this.goNext.nativeElement.classList.remove('active');
		}
		else if ($event.code === "ArrowLeft") {
			this.clickGoPrev();
			this.goPrev.nativeElement.classList.remove('active');
		}
	}

	constructor(public store: Store<IStatusBarState>) {

	}

	ngOnInit(): void {

		this.setSubscribers();

		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItems.pinPointIndicator,
			value: true
		}));


	}

	setSubscribers() {
		this.selectedLayoutIndex$.subscribe((_selected_layout_index: number) => {
			this.selected_layout_index = _selected_layout_index;
		});

		this.layouts$.subscribe((_layouts: MapsLayout[]) => {
			this.layouts = _layouts;
		});

		this.showLinkCopyToast$.subscribe((_showLinkCopyToast) => {
			this.showLinkCopyToast = _showLinkCopyToast;
		});

		this.flags$.subscribe(flags => {
			//I want to check that the one that was changing is the pin point search
			if (this.flags.get(statusBarFlagsItems.pinPointSearch) !== flags.get(statusBarFlagsItems.pinPointSearch)) {
				this.toggleEditMode.emit();
			}
			this.flags = new Map(flags) as Map<string, boolean>;
		});
	}

	toggleTimelineStartEndSearch(event) {
		this.timeSelectionEditIcon = !this.timeSelectionEditIcon;
	}

	applyTimelinePickerResult(result){
		console.log(result);
		//apply here your dispathces
		this.toggleTimelineStartEndSearch({});

	}

	layoutSelectChange(selected_layout_index: number): void {
		this.store.dispatch(new ChangeLayoutAction(selected_layout_index));
	}

	onShowToastChange(value: boolean) {
		this.store.dispatch(new SetLinkCopyToastValueAction(value));
	}

	copyLink(): void {
		this.store.dispatch(new CopySelectedCaseLinkAction());
	}

	openLink(): void {
		this.store.dispatch(new OpenShareLink());
	}

	toggleMapPointSearch() {
		this.store.dispatch(new UpdateStatusFlagsAction({key: statusBarFlagsItems.pinPointSearch}));
	}

	togglePinPointIndicatorView() {
		this.store.dispatch(new UpdateStatusFlagsAction({key: statusBarFlagsItems.pinPointIndicator}));
	}


	clickGoPrev(): void {
		this.store.dispatch(new GoPrevAction());
	}

	clickGoNext(): void {
		this.store.dispatch(new GoNextAction());
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	clickFavorite(): void {
		this.store.dispatch(new FavoriteAction());
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldViewAction());
	}

	toggleHistogramEqualization() {
		this.histogramActive = !this.histogramActive;
		this.store.dispatch(new ToggleHistogramAction());		
	}
}
