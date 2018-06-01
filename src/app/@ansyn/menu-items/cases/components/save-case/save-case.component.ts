import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	OnInit,
	ViewChild
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Case } from '../../models/case.model';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, SaveCaseAsAction } from '../../actions/cases.actions';
import { cloneDeep as _cloneDeep } from 'lodash';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, -100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }))])
	])
];

@Component({
	selector: 'ansyn-save-case',
	templateUrl: './save-case.component.html',
	styleUrls: ['./save-case.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations
})
export class SaveCaseComponent implements OnInit {
	@HostBinding('@modalContent')
	get modalContent() {
		return true;
	};

	selectedCase$: Observable<Case> = this.store.select(casesStateSelector)
		.pluck<ICasesState, Case>('selectedCase')
		.distinctUntilChanged()
		.map(_cloneDeep);

	caseModel: Case;

	@ViewChild('nameInput') nameInput: ElementRef;

	@HostListener('@modalContent.done')
	selectText() {
		this.nameInput.nativeElement.select();
	}

	constructor(protected store: Store<ICasesState>) {
	}

	ngOnInit(): void {
		this.selectedCase$.subscribe((selectedCase: Case) => {
			this.caseModel = selectedCase;
		});
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase() {
		this.store.dispatch(new SaveCaseAsAction(this.caseModel));
		this.close();
	}
}

