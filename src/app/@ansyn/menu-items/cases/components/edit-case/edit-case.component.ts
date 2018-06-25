import { Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { Observable } from 'rxjs';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { cloneDeep } from 'lodash';
import { Case } from '../../models/case.model';
import 'rxjs/add/operator/distinctUntilChanged';
import { CasesService } from '../../services/cases.service';
import { CasePreview } from '../../models/case.model';
import { selectContextsArray } from '@ansyn/context/reducers/context.reducer';
import { Context } from '@ansyn/core/models/context.model';

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
	selector: 'ansyn-edit-case',
	templateUrl: './edit-case.component.html',
	styleUrls: ['./edit-case.component.less'],
	animations
})

export class EditCaseComponent implements OnInit {
	@HostBinding('@modalContent')
	get modalContent() {
		return true;
	};

	casesState$: Observable<ICasesState> = this.store.select(casesStateSelector);

	activeCase$: Observable<Case> = this.casesState$
		.distinctUntilChanged()
		.map(this.getCloneActiveCase.bind(this));

	contextsList$: Observable<Context[]> = this.store.select(selectContextsArray)
		.map(this.addDefaultContext);

	contextsList: Context[];
	caseModel: Case;
	editMode = false;

	@ViewChild('nameInput') nameInput: ElementRef;

	@HostListener('@modalContent.done')
	selectText() {
		this.nameInput.nativeElement.select();
	}

	constructor(protected store: Store<ICasesState>, protected casesService: CasesService) {
	}

	addDefaultContext(context: Context[]): Context[] {
		return [
			{ id: 'default', name: 'Default Case', creationTime: new Date()},
			...context
		];
	}

	getCloneActiveCase(caseState: ICasesState): CasePreview {
		let sCase: CasePreview = caseState.entities[caseState.modal.id];
		if (sCase) {
			this.editMode = true;
			sCase = cloneDeep(sCase);
		} else {
			const selectedCase = cloneDeep(caseState.selectedCase);
			sCase = this.getEmptyCase(selectedCase);
		}

		return sCase;
	}

	getEmptyCase(selectedCase: Case): Case {
		const activeMap = selectedCase.state.maps.data.find(({ id }) => id === selectedCase.state.maps.activeMapId);

		return {
			name: '',
			owner: '',
			id: '',
			autoSave: true,
			lastModified: new Date(),
			creationTime: new Date(),
			state: {
				...selectedCase.state,
				maps: {
					layout: 'layout1',
					activeMapId: activeMap.id,
					data: [activeMap]
				},
				time: {
					type: 'absolute',
					from: new Date(0),
					to: new Date()
				},
				favoriteOverlays: [],
				overlaysManualProcessArgs: {}
			}
		};
	}

	ngOnInit(): void {

		this.activeCase$.subscribe((activeCase: Case) => {
			this.caseModel = activeCase;
		});

		this.contextsList$.subscribe((_contextsList: Context[]) => {
			this.contextsList = _contextsList;
		});

	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase(contextIndex: number) {
		if (this.editMode) {
			this.store.dispatch(new UpdateCaseAction({ updatedCase: this.caseModel, forceUpdate: true }));
		} else {
			const selectContext = this.contextsList[contextIndex];
			this.caseModel = cloneDeep(this.casesService.updateCaseViaContext(selectContext, this.caseModel));
			this.casesService.createCase(this.caseModel)
				.subscribe((addedCase: Case) => {
					this.store.dispatch(new AddCaseAction(addedCase));
				});
		}
		this.close();
	}

}
