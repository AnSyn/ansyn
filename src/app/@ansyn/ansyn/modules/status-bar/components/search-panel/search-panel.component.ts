import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { IStatusBarState, selectGeoFilterActive, selectGeoFilterType } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { animate, style, transition, trigger, AnimationTriggerMetadata } from '@angular/animations';
import { filter, tap } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import { ICaseDataInputFiltersState, ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import {
	IMultipleOverlaysSourceConfig,
	IOverlaysSourceProvider,
	MultipleOverlaysSourceConfig
} from '../../../core/models/multiple-overlays-source-config';
import { SetToastMessageAction } from '@ansyn/map-facade';
import {
	isArrowLeftKey,
	isArrowRightKey,
	isBackspaceKey,
	isDigitKey,
	isEnterKey,
	isEscapeKey
} from '../../../core/utils/keyboardKey';
import {
	LogManualSearchTime,
	LogSearchPanelPopup,
	SetOverlaysCriteriaAction
} from '../../../overlays/actions/overlays.actions';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';
import { toastMessages } from '../../../core/models/toast-messages';

const moment = momentNs;

const fadeAnimations: AnimationTriggerMetadata = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-100%)' }),
		animate('0.2s', style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }))
	]),
	transition(':leave', [
		style({ opacity: 1, transform: 'translateY(calc(-100% - 15px))' }),
		animate('0.2s', style({ opacity: 0, transform: 'translateY(-100%)' }))
	])
]);

type SearchPanelTitle = 'DataInputs' | 'TimePicker' | 'TimePickerPreset' | 'LocationPicker';
const DATE_FORMAT = 'DD/MM/YYYY HH:mm';

@Component({
	selector: 'ansyn-search-panel',
	templateUrl: './search-panel.component.html',
	styleUrls: ['./search-panel.component.less'],
	animations: [fadeAnimations]
})
@AutoSubscriptions()
export class SearchPanelComponent implements OnInit, OnDestroy {
	popupExpanded = new Map<SearchPanelTitle, boolean>([['DataInputs', false], ['TimePicker', false], ['LocationPicker', false], ['TimePickerPreset', false]]);
	timeRange: Date[];
	timeError: { from: boolean, to: boolean } = { from: false, to: false };
	dataInputFilterTitle: string;
	timeSelectionTitle: { from: string, to: string };
	timeSelectionOldTitle: { from: string, to: string };
	geoFilterTitle: string;
	geoFilterCoordinates: string;
	dataInputFilters: ICaseDataInputFiltersState;
	@ViewChild('timePickerTitleFrom', { static: true }) timePickerInputFrom: ElementRef;
	@ViewChild('timePickerTitleTo', { static: true }) timePickerInputTo: ElementRef;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.timeRange = _time && [_time.from, _time.to];
			if (_time && _time.to && _time.from) {
				this.timeSelectionTitle = {
					from: moment(this.timeRange[0]).format(DATE_FORMAT),
					to: moment(this.timeRange[1]).format(DATE_FORMAT)
				};
				this.revertTime(); // if time was set from outside, cancel manual editing mode
				this.timeSelectionOldTitle = { ...this.timeSelectionTitle };
				this.timeError = {
					from: !this.validateDate(this.timeSelectionTitle.from),
					to: !this.validateDate(this.timeSelectionTitle.to)
				}
			}
		})
	);

	@AutoSubscription
	dataInputFilters$ = this.store$.select(selectDataInputFilter).pipe(
		filter((caseDataInputFiltersState: ICaseDataInputFiltersState) => Boolean(caseDataInputFiltersState) && Boolean(caseDataInputFiltersState.filters)),
		tap((caseDataInputFiltersState: ICaseDataInputFiltersState) => {
			this.dataInputFilters = caseDataInputFiltersState;
			const selectedFiltersSize = this.dataInputFilters.filters.length;
			let dataInputsSize = 0;
			Object.values(this.multipleOverlaysSourceConfig.indexProviders)
				.filter(({ inActive }: IOverlaysSourceProvider) => !inActive)
				.forEach(({ dataInputFiltersConfig }) => dataInputsSize += dataInputFiltersConfig.children.length);
			this.dataInputFilterTitle = this.dataInputFilters.fullyChecked ? 'All' : `${ selectedFiltersSize }/${ dataInputsSize }`;
			if (!caseDataInputFiltersState.fullyChecked && caseDataInputFiltersState.filters.length === 0) {
				this.popupExpanded.set('DataInputs', true)
			}
		})
	);

	@AutoSubscription
	geoFilter$ = combineLatest([
		this.store$.select(selectGeoFilterType),
		this.store$.select(selectGeoFilterActive)
	]).pipe(
		tap(([geoFilterType, active]) => {
			this.geoFilterTitle = `${ geoFilterType }`;
			this.popupExpanded.set('LocationPicker', active);
		})
	);

	@AutoSubscription
	updateGeoFilterCoordinates$ = this.store$.select(selectRegion).pipe(
		filter(Boolean),
		tap(({ coordinates }) => this.geoFilterCoordinates = coordinates.toString())
	);

	constructor(protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
				@Inject(MultipleOverlaysSourceConfig) private multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				dateTimeAdapter: DateTimeAdapter<any>
	) {
		dateTimeAdapter.setLocale(statusBarConfig.locale);
	}

	@AutoSubscription
	timeInputChangeFrom$ = () => merge(
		fromEvent(this.timePickerInputFrom.nativeElement, 'keydown'),
		fromEvent(this.timePickerInputTo.nativeElement, 'keydown')
	).pipe(
		tap(this.checkForTimeContentOk.bind(this))
	);

	@AutoSubscription
	loggerManualChangeTime$ = () => merge(
		fromEvent(this.timePickerInputFrom.nativeElement, 'keyup'),
		fromEvent(this.timePickerInputTo.nativeElement, 'keyup')
	).pipe(
		filter(isDigitKey),
		tap(this.logTimePickerChange.bind(this))
	);

	@AutoSubscription
	onSelectTitle$ = () => merge(fromEvent(this.timePickerInputFrom.nativeElement, 'mouseup'),
		fromEvent(this.timePickerInputTo.nativeElement, 'mouseup')).pipe(
		tap(this.selectOnlyNumber.bind(this))
	);

	@AutoSubscription
	disableDragText$ = () => merge(fromEvent(this.timePickerInputFrom.nativeElement, 'dragstart'),
		fromEvent(this.timePickerInputTo.nativeElement, 'dragstart')).pipe(
		tap((event: DragEvent) => event.preventDefault())
	);

	ngOnInit() {
	}

	toggleExpander(popupName: SearchPanelTitle, forceState?: boolean) {
		if (this.isDataInputsOk()) {
			const newState = forceState || !this.popupExpanded.get(popupName);
			if (newState) {
				this.store$.dispatch(new LogSearchPanelPopup({ popupName }));
			}
			this.popupExpanded.forEach((_, key, map) => {
				map.set(key, key === popupName ? newState : false)
			});
		} else {
			this.store$.dispatch(new SetToastMessageAction({
				toastText: 'Please select at least one type',
				showWarningIcon: true
			}));

		}
	}

	isActive(popup: SearchPanelTitle) {
		return this.popupExpanded.get(popup);
	}

	shouldCloseTimePicker() {
		if (this.popupExpanded.get('TimePicker') || this.popupExpanded.get('TimePickerPreset')) {
			this.closeTimePicker();
		}
	}

	ngOnDestroy() {
	}

	isDataInputsOk() {
		return this.dataInputFilters.fullyChecked || this.dataInputFilters.filters.length > 0;
	}

	// Time Picker functions
	// TODO: refactor eject timepicker logic outside search panel
	checkForTimeContentOk(event: any) {
		this.selectOnlyNumber();
		if (isArrowRightKey(event) || isArrowLeftKey(event)) {
			return;
		}
		if (isBackspaceKey(event)) {
			const selection = window.getSelection();
			if (selection.type === 'Caret' && !/[ \/:]/g.test(selection.anchorNode.textContent.charAt(selection.anchorOffset - 1))) {
				return;
			}
			selection.deleteFromDocument();
		}
		if (isDigitKey(event)) {
			// we subtracting 1 because we get the event before add the key.
			const limitLength = window.getSelection().type === 'Range' ? DATE_FORMAT.length : DATE_FORMAT.length - 1;
			if (event.target.textContent.length <= limitLength) {
				return;
			}
		}
		if (isEnterKey(event)) {
			this.store$.dispatch(new LogManualSearchTime({ from: this.timePickerInputFrom.nativeElement.textContent, to: this.timePickerInputTo.nativeElement.textContent }));

			if (!this.supportRangeDates()) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.notSupportRangeDates }));
			} else if (!this.checkTimeWasChange()) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.timeWasNotChange }));
			} else if (!this.setTimeCriteria()) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.invalidDate }));
			}
		}
		if (isEscapeKey(event)) {
			this.revertTime();
		}
		event.preventDefault();
	}

	openTimePickerPreset() {
		this.toggleExpander('TimePickerPreset', true);
	}

	closeTimePicker() {
		window.getSelection().empty();
		this.popupExpanded.set('TimePicker', false);
		this.popupExpanded.set('TimePickerPreset', false);
		if (!this.setTimeCriteria()) {
			this.revertTime();
		}
	}

	setTimeCriteria() {
		if (this.validateDates() && this.checkTimeWasChange() && this.supportRangeDates()) {
			const fromText = this.timePickerInputFrom.nativeElement.textContent;
			const toText = this.timePickerInputTo.nativeElement.textContent;

			const from = this.getDateFromString(fromText);
			let to = this.getDateFromString(toText);

			if (from.getTime() > to.getTime()) {
				to = from;
				this.timePickerInputTo.nativeElement.textContent = fromText;
			}

			this.store$.dispatch(new SetOverlaysCriteriaAction({ time: { from, to } }));

			return true;
		}
		return false;
	}

	selectOnlyNumber() {
		const selection = window.getSelection();
		if (selection.type === 'Range') {
			const { anchorOffset, focusOffset, anchorNode, focusNode } = selection;
			const ltr = anchorOffset < focusOffset;
			const minIndex = Math.min(anchorOffset, focusOffset);
			const maxIndex = Math.max(anchorOffset, focusOffset);
			const textContent = anchorNode.textContent;
			const contentToRemove = textContent.substring(minIndex, maxIndex);
			if (contentToRemove.split('').some(letterToRemove => ['/', ':', ' '].includes(letterToRemove))) {
				const offset = this.findExtentOffset(contentToRemove, !ltr);

				selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, ltr ? anchorOffset + offset : anchorOffset - offset);
			}
		}
	}

	validateDates() {
		this.timeError.from = !this.validateDate(this.timePickerInputFrom.nativeElement.textContent);
		this.timeError.to = !this.validateDate(this.timePickerInputTo.nativeElement.textContent);
		return !this.timeError.from && !this.timeError.to;
	}

	supportRangeDates() {
		this.timeError.from = this.earlyOrLateDate(this.timePickerInputFrom.nativeElement.textContent);
		this.timeError.to = this.earlyOrLateDate(this.timePickerInputTo.nativeElement.textContent);
		return !this.timeError.from && !this.timeError.to;
	}

	getDateFromString(date) {
		return moment(date, DATE_FORMAT, true).toDate();
	}

	revertTime() {
		this.timePickerInputTo.nativeElement.textContent = this.timeSelectionTitle.to;
		this.timePickerInputFrom.nativeElement.textContent = this.timeSelectionTitle.from;
		this.timeError.from = false;
		this.timeError.to = false;
	}

	logTimePickerChange() {
		const { from: oldFrom, to: oldTo } = this.timeSelectionOldTitle;
		const from = this.timePickerInputFrom.nativeElement.textContent;
		const to = this.timePickerInputTo.nativeElement.textContent;

		this.timeSelectionOldTitle.from = from;
		this.timeSelectionOldTitle.to = to;
	}

	private validateDate(date) {
		const dateFromFormat = moment(date, DATE_FORMAT, true);
		return dateFromFormat.isValid();
	}

	private earlyOrLateDate(date) {
		const dateFromFormat = moment(date, DATE_FORMAT, true);
		return dateFromFormat.toDate().getFullYear() < 1970 || dateFromFormat.toDate().getTime() > Date.now();
	}

	private findExtentOffset(content: string, fromLast: boolean) {
		const reg = /[ \/:]/g;
		const reverse = content.split('').reverse().join('');
		return fromLast ? reverse.search(reg) : content.search(reg)
	}

	private checkTimeWasChange() {
		return this.timePickerInputFrom.nativeElement.textContent !== this.timeSelectionTitle.from || this.timePickerInputTo.nativeElement.textContent !== this.timeSelectionTitle.to
	}

}
