import { Component, HostBinding, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { Observable, of } from 'rxjs';
import { AddCaseAction, CloseModalAction, UpdateCaseAction } from '../../actions/cases.actions';
import { cloneDeep } from 'lodash';
import { CasesService } from '../../services/cases.service';
import { map, take } from 'rxjs/operators';
import { ICase, ICasePreview } from '../../models/case.model';
import { LoggerService } from '../../../../core/services/logger.service';

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

	activeCase$: Observable<ICase> = this.casesState$
		.pipe(map(this.getCloneActiveCase.bind(this)));

	contextsList$: Observable<any[]> = of([]).pipe(
		map(this.addDefaultContext)
	);

	contextsList: any[];
	caseModel: ICase;
	editMode = false;
	activeCaseName: string;

	constructor(
		protected store: Store<ICasesState>,
		protected casesService: CasesService,
		protected loggerService: LoggerService
	) {
	}

	addDefaultContext(context: any[]): any[] {
		return [
			{ id: 'default', name: 'Default ICase', creationTime: new Date() },
			...context
		];
	}

	getCloneActiveCase(caseState: ICasesState): ICasePreview {
		let sCase: ICasePreview = caseState.entities[caseState.modal.id];
		if (sCase) {
			this.editMode = true;
			sCase = cloneDeep(sCase);
		} else {
			const selectedCase = cloneDeep(caseState.selectedCase);
			sCase = this.getEmptyCase(selectedCase);
		}

		return sCase;
	}

	getEmptyCase(selectedCase: ICase): ICase {
		let activeMap = selectedCase.state.maps.data.find(({ id }) => id === selectedCase.state.maps.activeMapId);
		if (!Boolean(activeMap)) {
			activeMap = selectedCase.state.maps.data[0];
		}

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
					from: new Date(0),
					to: new Date()
				},
				favoriteOverlays: [],
				overlaysManualProcessArgs: {}
			}
		};
	}

	ngOnInit(): void {

		this.activeCase$.pipe(take(1)).subscribe((activeCase: ICase) => {
			this.caseModel = activeCase;
			this.activeCaseName = activeCase && activeCase.name;
		});

		this.contextsList$.subscribe((_contextsList: any[]) => {
			this.contextsList = _contextsList;
		});
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase(contextIndex: number) {
		if (this.editMode) {
			this.loggerService.info(`Renaming case ${this.activeCaseName} to ${this.caseModel.name}`, 'Cases', 'RENAME_CASE');
			this.store.dispatch(new UpdateCaseAction({ updatedCase: this.caseModel, forceUpdate: true }));
		} else {
			const selectContext = this.contextsList[contextIndex];
			this.caseModel = cloneDeep(this.casesService.updateCaseViaContext(selectContext, this.caseModel));
			this.casesService.createCase(this.caseModel)
				.subscribe((addedCase: ICase) => {
					this.store.dispatch(new AddCaseAction(addedCase));
				});
		}
		this.close();
	}
}
