import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { IOverlaysState, selectLoading } from '../../reducers/overlays.reducer';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

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
	selector: 'ansyn-overlays-loader',
	templateUrl: './overlays-loader.component.html',
	styleUrls: ['./overlays-loader.component.less'],
	animations

})
export class OverlaysLoaderComponent {
	overlaysLoader$: Observable<any> = this.store$.select(selectLoading);

	constructor(protected store$: Store<IOverlaysState>) {
	}


}
