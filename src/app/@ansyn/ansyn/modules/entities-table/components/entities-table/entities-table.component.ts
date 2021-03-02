import {
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef,
	ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { animate, style, transition, trigger, state } from '@angular/animations';
import { IEntitiesTableData, ITableRowModel } from '../../../core/models/IEntitiesTableModel';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])
	]),
	trigger('rotateArrow', [
		state('true', style({
			transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
		})),
		state('false', style({
			transform: 'rotateZ(135deg) translateY(-75%)'
		})),
		transition('1 <=> 0', animate('0.1s'))
	])
];


@Component({
	selector: 'ansyn-entities-table',
	templateUrl: './entities-table.component.html',
	styleUrls: ['./entities-table.component.less'],
	animations
})
export class EntitiesTableComponent<T> implements OnInit, OnDestroy {
	@ViewChild('tbodyElement') tbodyElement: ElementRef;
	@Input() title: string;
	@Input() entities: IEntitiesTableData<T>;
	@Input() menu: ElementRef;
	@Input() selectedId: string;
	@Input() activatedId: string;
	@Input() collapsible = false;
	@Input() rowsData: ITableRowModel<T>[];
	@Input() readonly emptyTableLabel = 'No entities';
	@Output() onInfinityScroll = new EventEmitter();
	@Output() onRowHover = new EventEmitter<string>();
	@Output() onEntitySelect = new EventEmitter<string>(true);
	@ContentChild('menuItem', { static: false }) menuItemRef: TemplateRef<any>;
	show = true;

	constructor(
		protected store$: Store<any>
	) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}


	onEntityAdded() {
		if (this.tbodyElement) {
			this.tbodyElement.nativeElement.scrollTop = 0;
		}
	}

	onMouseEnterRow(row: HTMLDivElement, entityId: string) {
		this.onRowHover.emit(entityId);
		row.classList.add('mouse-enter');
	}

	onMouseLeaveRow(row: HTMLDivElement) {
		this.onRowHover.emit(undefined);
		row.classList.remove('mouse-enter');
	}

	menuClick($event: MouseEvent, row: HTMLDivElement) {
		row.classList.remove('mouse-enter');
		$event.stopPropagation();
	}
}
