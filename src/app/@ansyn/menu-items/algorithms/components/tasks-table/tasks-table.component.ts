import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DeleteTaskComponent } from '../delete-task/delete-task.component';
import { Store } from '@ngrx/store';
import { LoadAlgorithmTasksAction, OpenModalAction } from '../../actions/algorithms.actions';
import { getTimeFormat } from '@ansyn/core';
import { AlgorithmsEffects } from '../../effects/algorithms.effects';
import { Observable } from 'rxjs';
import { algorithmsStateSelector, IAlgorithmState, ITaskModal } from '../../reducers/algorithms.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, map, pluck, tap } from 'rxjs/internal/operators';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])
	])
];


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

	taskState$: Observable<IAlgorithmState> = this.store$.select(algorithmsStateSelector);

	modalTaskId$: Observable<string> = this.taskState$.pipe(
		pluck<IAlgorithmState, ITaskModal>('modal'),
		distinctUntilChanged(),
		pluck<ITaskModal, string>('id')
	);

	@AutoSubscription
	selectedTaskId$: Observable<string> = this.taskState$.pipe(
		map((state: IAlgorithmState) => state.selectedTask ? state.selectedTask.id : null),
		distinctUntilChanged(),
		tap((selectedTaskId) => this.selectedTaskId = selectedTaskId)
	);

	selectedTaskId: string;

	constructor(protected store$: Store<IAlgorithmState>, protected tasksEffects: AlgorithmsEffects) {
		this.tasksEffects.onAddTask$.subscribe(this.onTasksAdded.bind(this));
	}

	ngOnInit(): void {
		this.loadTasks();
	}

	ngOnDestroy(): void {
	}

	loadTasks() {
		this.store$.dispatch(new LoadAlgorithmTasksAction());
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

	removeTask(taskId: string): void {
		this.store$.dispatch(new OpenModalAction({ component: DeleteTaskComponent, taskId }));
	}

	selectTask(taskId: string): void {
	}

	formatTime(timeToFormat: Date): string {
		return getTimeFormat(timeToFormat);
	}

}
