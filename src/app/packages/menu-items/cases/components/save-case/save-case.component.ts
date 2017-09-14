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
import { ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, SaveDefaultCaseAction } from '../../actions/cases.actions';
import { cloneDeep as _cloneDeep } from 'lodash';

const animations_during = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, -100%)'
		}), animate(animations_during, style({'backgroundColor': 'white', transform: 'translate(0, 0)'}))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animations_during, style({'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}))]),
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

	selected_case$: Observable<Case> = this.store.select('cases')
		.pluck('selected_case')
		.distinctUntilChanged()
		.map(_cloneDeep);

	case_model: Case;

	@ViewChild('name_input') name_input: ElementRef;

	@HostListener('@modalContent.done')
	selectText() {
		this.name_input.nativeElement.select();
	}

	constructor(private store: Store<ICasesState>) {
	}

	ngOnInit(): void {
		this.selected_case$.subscribe((selected_case: Case) => {
			this.case_model = selected_case;
		});
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase() {
		this.store.dispatch(new SaveDefaultCaseAction(this.case_model));
		this.close();
	}
}

