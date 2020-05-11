import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as momentNs from 'moment';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { IStatusBarState, selectGeoFilterActive, selectGeoFilterType } from '../../reducers/status-bar.reducer';
import { StatusBarConfig } from '../../models/statusBar.config';
import { Store } from '@ngrx/store';
import { combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { AnimationTriggerMetadata } from '@angular/animations/src/animation_metadata';
import { filter, tap } from 'rxjs/operators';
import { selectDataInputFilter, selectRegion, selectTime } from '../../../overlays/reducers/overlays.reducer';
import { ICaseDataInputFiltersState, ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import {
	IMultipleOverlaysSourceConfig, IOverlaysSourceProvider,
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
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { LoggerService } from '../../../core/services/logger.service';

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
	timeError: { from: boolean, to: boolean };
	dataInputFilterTitle: string;
	timeSelectionTitle: { from: string, to: string };
	geoFilterTitle: string;
	geoFilterCoordinates: string;
	dataInputFilters: ICaseDataInputFiltersState;
	@ViewChild('timePickerTitleFrom') timePickerInputFrom: ElementRef;
	@ViewChild('timePickerTitleTo') timePickerInputTo: ElementRef;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.timeRange = _time && [_time.from, _time.to];
			if (_time && _time.to && _time.from) {
				this.timeSelectionTitle = {
					from: moment(this.timeRange[0]).format(DATE_FORMAT),
					to: moment(this.timeRange[1]).format(DATE_FORMAT)
				};
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
			const dataInputsSize = Object.values(this.multipleOverlaysSourceConfig.indexProviders).filter(({inActive}: IOverlaysSourceProvider) => !inActive).length;
			this.dataInputFilterTitle = this.dataInputFilters.fullyChecked ? 'All' : `${selectedFiltersSize}/${dataInputsSize}`;

		})
	);

	@AutoSubscription
	geoFilter$ = combineLatest(
		this.store$.select(selectGeoFilterType),
		this.store$.select(selectGeoFilterActive)
	).pipe(
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
				protected loggerService: LoggerService,
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
		tap((event: any) => this.loggerService.info('change From date manually ' + event.target.textContent))
	);

	@AutoSubscription
	onSelectTitle$ = () => merge(fromEvent(this.timePickerInputFrom.nativeElement, 'mouseup'),
		fromEvent(this.timePickerInputTo.nativeElement, 'mouseup')).pipe(
		tap(this.selectOnlyNumber.bind(this))
	);

	@AutoSubscription
	disableDragText$ = () => merge(fromEvent(this.timePickerInputFrom.nativeElement, 'dragstart'),
		fromEvent(this.timePickerInputTo.nativeElement, 'dragstart')).pipe(
		tap( (event: DragEvent) =>  event.preventDefault())
	);

	ngOnInit() {
	}

	toggleExpander(popup: SearchPanelTitle, forceState?: boolean) {
		if (this.isDataInputsOk()) {
			const newState = forceState || !this.popupExpanded.get(popup);
			this.popupExpanded.forEach((_, key, map) => {
				map.set(key , key === popup ? newState : false)
			});
		}
		else {
			this.store$.dispatch(new SetToastMessageAction({toastText: 'Please select at least one type', showWarningIcon: true}));

		}
	}

	isActive(popup: SearchPanelTitle) {
		return this.popupExpanded.get(popup);
	}

	ngOnDestroy() {
	}

	isDataInputsOk() {
		return this.dataInputFilters.fullyChecked || this.dataInputFilters.filters.length > 0;
	}

	// Time Picker functions
	// TODO: refactor eject timepicker logic outside search panel
	checkForTimeContentOk(event: any) {
		if (isArrowRightKey(event) || isArrowLeftKey(event)) {
			if (event.shiftKey) {
				this.selectOnlyNumber();
			}
			return;
		}
		if (isBackspaceKey(event)) {
			const selection = window.getSelection();
			if (selection.type === 'Caret' && !/[ \/:]/g.test(selection.baseNode.textContent.charAt(selection.baseOffset - 1))) {
				return;
			}
			selection.deleteFromDocument();
		}
		if (isDigitKey(event)) {
			this.loggerService.info('change date manual ' + this.timePickerInputFrom.nativeElement.textContent + ' - ' + this.timePickerInputTo.nativeElement.textContent)
			return;
		}
		if (isEnterKey(event)) {
			if (!this.setTimeCriteria()) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: 'Invalid date' }));
			}
			this.loggerService.info(`press enter on time picker ${ this.timePickerInputFrom.nativeElement.textContent } - ${ this.timePickerInputTo.nativeElement.textContent }`);
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
		if (this.validateDates()) {
			const from = this.getDateFromString(this.timePickerInputFrom.nativeElement.textContent);
			const to = this.getDateFromString(this.timePickerInputTo.nativeElement.textContent);
			this.store$.dispatch(new SetOverlaysCriteriaAction({
				time: {
					type: 'absolute',
					from,
					to
				}
			}));
			return true;
		}
		return false;
	}

	selectOnlyNumber() {
		const selection = window.getSelection();
		if (selection.type === 'Range') {
			const { baseOffset, extentOffset, baseNode, extentNode} = selection;
			const ltr = baseOffset < extentOffset;
			const minIndex = Math.min(baseOffset, extentOffset);
			const maxIndex = Math.max(baseOffset, extentOffset);
			const textContent = baseNode.textContent;
			const contentToRemove = textContent.substring(minIndex, maxIndex);
			if (contentToRemove.split('').some(letterToRemove => ['/', ':', ' '].includes(letterToRemove))) {
				const offset = this.findExtentOffset(contentToRemove, !ltr);

				selection.setBaseAndExtent(baseNode, baseOffset, extentNode, ltr ? baseOffset + offset : baseOffset - offset);
			}
		}
	}

	validateDates() {
		this.timeError.from = !this.validateDate(this.timePickerInputFrom.nativeElement.textContent);
		this.timeError.to = !this.validateDate(this.timePickerInputTo.nativeElement.textContent);
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

	private validateDate(date) {
		return moment(date, DATE_FORMAT, true).isValid();
	}

	private findExtentOffset(content: string, fromLast: boolean) {
		const reg = /[ \/:]/g;
		const reverse = content.split('').reverse().join('');
		return fromLast ? reverse.search(reg) : content.search(reg)
	}

}
