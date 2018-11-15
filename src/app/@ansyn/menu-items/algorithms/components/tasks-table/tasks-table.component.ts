import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DeleteTaskAction, LoadTasksAction } from '../../actions/tasks.actions';
import { getTimeFormat } from '@ansyn/core';
import { TasksEffects } from '../../effects/tasks.effects';
import { Observable } from 'rxjs';
import {
	ITaskModal,
	ITasksState,
	selectTaskEntities,
	selectTasksIds,
	tasksStateSelector
} from '../../reducers/tasks.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, map, pluck, tap } from 'rxjs/internal/operators';
import { Dictionary } from '@ngrx/entity/src/models';
import { AlgorithmTaskPreview } from '../../models/tasks.model';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])
	])
];

interface IModalData {
	id: string,
	show: boolean
}

@Component({
	selector: 'ansyn-tasks-table',
	templateUrl: './tasks-table.component.html',
	styleUrls: ['./tasks-table.component.less'],
	animations
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class TasksTableComponent implements OnInit, OnDestroy {
	@ViewChild('tbodyElement') tbodyElement: ElementRef;

	taskState$: Observable<ITasksState> = this.store$.select(tasksStateSelector);

	ids$: Observable<string[] | number[]> = this.store$.select(selectTasksIds);
	entities$: Observable<Dictionary<AlgorithmTaskPreview>> = this.store$.select(selectTaskEntities);

	modalTaskId$: Observable<string> = this.taskState$.pipe(
		pluck<ITasksState, ITaskModal>('modal'),
		distinctUntilChanged(),
		pluck<ITaskModal, string>('id')
	);

	@AutoSubscription
	selectedTaskId$: Observable<string> = this.taskState$.pipe(
		map((state: ITasksState) => state.selectedTask ? state.selectedTask.id : null),
		distinctUntilChanged(),
		tap((selectedTaskId) => this.selectedTaskId = selectedTaskId)
	);

	selectedTaskId: string;

	modal: IModalData;

	constructor(protected store$: Store<ITasksState>, protected tasksEffects: TasksEffects) {
		this.tasksEffects.onAddTask$.subscribe(this.onTasksAdded.bind(this));
	}

	ngOnInit(): void {
		this.loadTasks();
	}

	ngOnDestroy(): void {
	}

	loadTasks() {
		this.store$.dispatch(new LoadTasksAction());
	}

	onTasksAdded() {
		if (this.tbodyElement) {
			this.tbodyElement.nativeElement.scrollTop = 0;
		}
	}

	onMouseEnterTaskRow(taskMenu: HTMLDivElement, taskRow: HTMLDivElement, tbodyElement: HTMLDivElement) {
		let offsetTop = taskRow.offsetTop;
		let scrollTop = tbodyElement.scrollTop;
		taskMenu.style.top = `${offsetTop - scrollTop + 1}px`;
		taskRow.classList.add('mouse-enter');
	}

	onMouseLeaveTaskRow(taskRow: HTMLDivElement) {
		taskRow.classList.remove('mouse-enter');
	}

	taskMenuClick($event: MouseEvent, taskRow: HTMLDivElement) {
		taskRow.classList.remove('mouse-enter');
		$event.stopPropagation();
	}

	selectTask(taskId: string): void {
	}

	formatTime(timeToFormat: Date): string {
		return getTimeFormat(timeToFormat);
	}

	showModal(id) {
		this.modal = {
			id: id,
			show: true
		}
	}

	hideModal() {
		this.modal.show = false;
	}

	onModalResult(value: boolean) {
		if (value) {
			this.removeTask(this.modal.id)
		}
		this.hideModal();
	}

	removeTask(id) {
		this.store$.dispatch(new DeleteTaskAction(id));
	}
}
