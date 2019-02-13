import { Inject, Injectable } from '@angular/core';
import { SetMapsDataActionStore } from '../../../actions/map.actions';
import { Store } from '@ngrx/store';
import { DOCUMENT } from '@angular/common';

export interface IDragDropData {
	target: HTMLElement;
	dragElement: HTMLElement;
	dropElement?: HTMLElement;
	dragElementInitialBoundingBox: ClientRect;
	ids: string[];
	entities: object;
}

@Injectable()
export class DragDropMapService {
	TRANSITION_DURATION = 500;
	data: IDragDropData = null;

	constructor(protected store: Store<any>, @Inject(DOCUMENT) protected document: any) {
	}

	onMouseDown($event, dragElement: HTMLElement, ids: string[], entities: object) {
		this.document.body.style.userSelect = 'none';
		dragElement.classList.add('draggable');
		const { currentTarget: target } = $event;
		const dragElementInitialBoundingBox = dragElement.getBoundingClientRect();
		this.data = { target, dragElement, dragElementInitialBoundingBox, ids, entities };
		this.document.addEventListener('mousemove', this.mouseMove);
		this.document.addEventListener('mouseup', this.mouseUp);
	}

	mouseMove = ($event) => {
		const { target, dragElement, dropElement, dragElementInitialBoundingBox } = this.data;
		const { width: targetWidth, height: targetHeight } = target.getBoundingClientRect();
		const { left: initialLeft, top: initialTop } = dragElementInitialBoundingBox;
		const { left, top, width, height } = dragElement.getBoundingClientRect();
		if (dropElement) {
			dropElement.style.filter = null;
			dropElement.querySelector<HTMLElement>('.active-border').style.height = null;
		}
		dragElement.style.pointerEvents = 'none';
		const pointElem = this.document.elementFromPoint(left + (width / 2), top + (height / 2));
		const newDropElement = <HTMLElement> pointElem && pointElem.closest('.map-container-wrapper');
		if (newDropElement) {
			newDropElement.style.filter = 'blur(2px)';
			newDropElement.querySelector('.active-border').style.height = '100%';
		}
		this.data.dropElement = newDropElement;
		dragElement.style.transition = null;
		dragElement.style.zIndex = '200';
		dragElement.style.transform = `translate(${$event.clientX - initialLeft - (targetWidth / 2)}px, ${$event.clientY - initialTop - (targetHeight / 2)}px)`;
	};

	mouseUp = () => {
		const { dragElement, dropElement, dragElementInitialBoundingBox, ids: mapIds, entities } = this.data;
		const { left: initialLeft, top: initialTop } = dragElementInitialBoundingBox;
		this.document.body.style.userSelect = null;
		dragElement.style.transition = `${this.TRANSITION_DURATION}ms`;

		const onDragTransitionEnd = ($event) => {
			const { target } = $event;
			target.classList.remove('draggable');
			target.style.pointerEvents = null;
			target.style.transition = null;
			target.style.transform = null;
			target.style.zIndex = null;
			target.removeEventListener('transitionend', onDragTransitionEnd)
		};

		const onDropTransitionEnd = ($event) => {
			const { target } = $event;
			target.style.transition = null;
			target.style.transform = null;
			target.style.zIndex = null;
			target.querySelector('.active-border').style.height = null;
			const ids = [...mapIds];
			const id1 = dragElement.id;
			const id2 = dropElement.id;
			const indexOf1 = ids.indexOf(id1);
			const indexOf2 = ids.indexOf(id2);
			ids[indexOf1] = id2;
			ids[indexOf2] = id1;
			const mapsList = ids.map((id) => entities[id]);
			this.store.dispatch(new SetMapsDataActionStore({ mapsList }));
			target.removeEventListener('transitionend', onDropTransitionEnd)
		};

		dragElement.addEventListener('transitionend', onDragTransitionEnd);

		if (dropElement) {
			dropElement.addEventListener('transitionend', onDropTransitionEnd);
			const { left: dropLeft, top: dropTop } = dropElement.getBoundingClientRect();
			dropElement.style.filter = null;
			dropElement.style.transition = `${this.TRANSITION_DURATION}ms`;
			dropElement.style.transform = `translate(${initialLeft - dropLeft}px, ${initialTop - dropTop}px)`;
			dragElement.style.transform = `translate(${dropLeft - initialLeft}px, ${dropTop - initialTop}px)`;
			dropElement.style.zIndex = '199';
			dropElement.classList.remove('droppable');
		} else {
			dragElement.style.transform = `translate(0, 0)`;
		}

		this.data = null;
		this.document.removeEventListener('mousemove', this.mouseMove);
		this.document.removeEventListener('mouseup', this.mouseUp);
	};
}
