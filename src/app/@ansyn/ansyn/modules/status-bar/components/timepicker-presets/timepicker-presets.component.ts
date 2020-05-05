import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ICaseTimeState } from '../../../menu-items/cases/models/case.model';
import { SetOverlaysCriteriaAction } from '../../../overlays/actions/overlays.actions';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { selectTime } from '../../../overlays/reducers/overlays.reducer';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-timepicker-presets',
	templateUrl: './timepicker-presets.component.html',
	styleUrls: ['./timepicker-presets.component.less'],
})

@AutoSubscriptions()
export class TimepickerPresetsComponent implements OnInit, OnDestroy {

	@Output() hideMe = new EventEmitter<boolean>();
	@Output() openTimePicker = new EventEmitter<boolean>();
	timeRange: Date[];
	presetsData = [
		{
			title: '7 days ago',
			days: 7
		},
		{
			title: '30 days ago',
			days: 30
		},
		{
			title: '60 days ago',
			days: 60
		}
	];

	@AutoSubscription
	time$: Observable<ICaseTimeState> = this.store$.select(selectTime).pipe(
		tap(_time => {
			this.timeRange = _time && [_time.from, _time.to];
		})
	);

	constructor(protected store$: Store<any>) {
	}

	setPreset(days: number) {
		const currentDate = new Date();
		let from = new Date();
		from.setDate(from.getDate() - days);

		const time: ICaseTimeState = {
			from,
			to: currentDate,
			type: 'absolute'
		};

		this.store$.dispatch(new SetOverlaysCriteriaAction({ time }));
		this.closePresets();
	}

	closePresets() {
		this.hideMe.emit();
	}

	toggleTimePicker() {
		this.openTimePicker.emit();
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

}
