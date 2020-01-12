import { Component, EventEmitter, HostBinding, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { CasesService } from '../../services/cases.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, 100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)' }))])
	])
];

@Component({
	selector: 'ansyn-delete-case',
	templateUrl: './delete-case.component.html',
	styleUrls: ['./delete-case.component.less'],
	animations
})

export class DeleteCaseComponent implements OnInit {
	@HostBinding('@modalContent') readonly modalContent = true;

	activeCase$ = this.store
		.select(casesStateSelector)
		.pipe(map((cases) => cases.entities[cases.modal.id]));

	activeCase: ICasePreview;

	@Output() submitCase = new EventEmitter();

	constructor(protected store: Store<ICasesState>, protected casesService: CasesService) {
	}

	ngOnInit() {
		this.activeCase$.subscribe((activeCase) => this.activeCase = activeCase);
	}

	close(): void {
		this.store.dispatch(CloseModalAction());
	}

	onSubmitRemove() {
		(<Observable<any>>this.casesService.removeCase(this.activeCase.id))
			.pipe(
				tap(() => this.store.dispatch(DeleteCaseAction({payload: this.activeCase.id}))),
				catchError(() => of(false)),
				tap(() => this.close())
			)
			.subscribe();
	}

}
