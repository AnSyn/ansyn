import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { fromEvent, merge, Observable } from 'rxjs';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { selectTime } from '../../../overlays/reducers/overlays.reducer';
import { filter, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import {
	isArrowLeftKey,
	isArrowRightKey,
	isBackspaceKey,
	isDigitKey,
	isEnterKey, isEscapeKey
} from '../../../core/utils/keyboardKey';
import { LogManualSearchTime, SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { toastMessages } from '../../../core/models/toast-messages';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IStatusBarConfig } from '../../models/statusBar-config.model';

const DATE_FORMAT = 'DD/MM/YYYY HH:mm';

@Component({
	selector: 'ansyn-time-picker-container',
	templateUrl: './time-picker-container.component.html',
	styleUrls: ['./time-picker-container.component.less']
})

@AutoSubscriptions()
export class TimePickerContainerComponent implements OnInit, OnDestroy {
	@Input() openTop: boolean;
	isPresetOpen: boolean;
	isPickerOpen: boolean;
	timeError: { from: boolean, to: boolean } = { from: false, to: false };
	timeRange: Date[];
	timeSelectionTitle: { from: string, to: string };
	timeSelectionOldTitle: { from: string, to: string };
	@ViewChild('timePickerTitleFrom', { static: true }) timePickerInputFrom: ElementRef;
	@ViewChild('timePickerTitleTo', { static: true }) timePickerInputTo: ElementRef;

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		filter(_time => Boolean(_time)),
		tap(({from, to}) => {
			this.timeRange = [from, to];
			if (to && from) {
				this.timeSelectionTitle = {
					from: moment(from).format(DATE_FORMAT),
					to: moment(to).format(DATE_FORMAT)
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

	constructor(protected store$: Store<IStatusBarState>, @Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
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

	logTimePickerChange() {
		const from = this.timePickerInputFrom.nativeElement.textContent;
		const to = this.timePickerInputTo.nativeElement.textContent;

		this.timeSelectionOldTitle.from = from;
		this.timeSelectionOldTitle.to = to;
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

	private findExtentOffset(content: string, fromLast: boolean) {
		const reg = /[ \/:]/g;
		const reverse = content.split('').reverse().join('');
		return fromLast ? reverse.search(reg) : content.search(reg)
	}

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
		if(this.checkTimeWasChange()) {
			if (isEnterKey(event)) {
				this.store$.dispatch(new LogManualSearchTime({
					from: this.timePickerInputFrom.nativeElement.textContent,
					to: this.timePickerInputTo.nativeElement.textContent
				}));
	
				if (!this.supportRangeDates()) {
					this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.notSupportRangeDates }));
				} else if (!this.setTimeCriteria()) {
					this.store$.dispatch(new SetToastMessageAction({ toastText: toastMessages.invalidDate }));
				}
			}
		}
		
		if (isEscapeKey(event)) {
			this.revertTime();
		}
		event.preventDefault();
	}

	validateDates() {
		this.timeError.from = !this.validateDate(this.timePickerInputFrom.nativeElement.textContent);
		this.timeError.to = !this.validateDate(this.timePickerInputTo.nativeElement.textContent);
		return !this.timeError.from && !this.timeError.to;
	}

	getDateFromString(date) {
		return moment(date, DATE_FORMAT, true).toDate();
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

	private checkTimeWasChange() {
		return this.timePickerInputFrom.nativeElement.textContent !== this.timeSelectionTitle.from || this.timePickerInputTo.nativeElement.textContent !== this.timeSelectionTitle.to
	}

	private earlyOrLateDate(date) {
		const dateFromFormat = moment(date, DATE_FORMAT, true);
		const notSupportedDate = 1970;
		return dateFromFormat.toDate().getFullYear() < notSupportedDate || dateFromFormat.toDate().getTime() > Date.now();
	}

	supportRangeDates() {
		this.timeError.from = this.earlyOrLateDate(this.timePickerInputFrom.nativeElement.textContent);
		this.timeError.to = this.earlyOrLateDate(this.timePickerInputTo.nativeElement.textContent);
		return !this.timeError.from && !this.timeError.to;
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}


	private validateDate(date) {
		const dateFromFormat = moment(date, DATE_FORMAT, true);
		return dateFromFormat.isValid();
	}

	revertTime() {
		this.timePickerInputTo.nativeElement.textContent = this.timeSelectionTitle.to;
		this.timePickerInputFrom.nativeElement.textContent = this.timeSelectionTitle.from;
		this.timeError.from = false;
		this.timeError.to = false;
	}

	openTimePicker() {
		this.isPresetOpen = false;
		this.isPickerOpen = true;
	}

	toggleTimePickerPreset() {
		this.isPresetOpen = !this.isPresetOpen;
	}

	toggleTimePicker() {
		this.isPickerOpen = !this.isPickerOpen;
	}

	closeTimePicker() {
		this.isPresetOpen = false;
		this.isPickerOpen = false;
	}

}
