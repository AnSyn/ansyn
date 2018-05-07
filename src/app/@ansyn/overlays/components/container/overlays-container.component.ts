import { Component, OnDestroy, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/pluck';
import '@ansyn/core/utils/store-element';
import { Store } from '@ngrx/store';
import { IOverlaysState, overlaysStateSelector } from '../../reducers/overlays.reducer';
import { Observable } from 'rxjs/Observable';
import { animate, style, transition, trigger } from '@angular/animations';
import { Actions } from '@ngrx/effects';

const animations: any[] = [
	trigger('timeline-status', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('0.2s', style({ opacity: 1 }))
		]),
		transition(':leave', [
			style({ opacity: 1 }),
			animate('0.2s', style({ opacity: 0 }))
		])
	])
];

@Component({
	selector: 'ansyn-overlays-container',
	templateUrl: './overlays-container.component.html',
	styleUrls: ['./overlays-container.component.less'],
	animations
})

export class OverlaysContainerComponent  {

	overlaysState$: Observable<IOverlaysState> = this.store$.select(overlaysStateSelector);

	overlaysLoader$: Observable<any> = this.overlaysState$
		.pluck <IOverlaysState, boolean>('loading')
		.distinctUntilChanged();

	constructor(protected store$: Store<IOverlaysState>) {
	}


}


