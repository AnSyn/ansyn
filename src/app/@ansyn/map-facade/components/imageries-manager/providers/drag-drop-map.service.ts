import { Injectable, Inject, OnInit } from '@angular/core';
import { SetMapsDataActionStore } from '../../../actions/map.actions';
import { Store } from '@ngrx/store';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class DragDropMapService implements OnInit {
	TRANSITION_DURATION = 500;

	currentTarget: HTMLElement;
	dragElement: HTMLElement;
	dropElement: HTMLElement;

	constructor(protected store: Store<any>, @Inject(DOCUMENT) protected document: Document) {
	}

	onMouseDown($event, dragElement, ids, mapsEntities) {
		this.currentTarget = $event.currentTarget;
		this.dragElement = dragElement;
		this.document.body.style.userSelect = 'none';
		this.dragElement.classList.add('draggable');

		const mouseMove = this.createMouseMove();
		const mouseUp = this.createMouseUp(mouseMove, ids, mapsEntities);

		this.document.addEventListener('mousemove', mouseMove);
		this.document.addEventListener('mouseup', mouseUp);
	}

	createMouseMove = () => {
		const { left: initialX, top: initialY } = this.dragElement.getBoundingClientRect();
		const { width: targetWidth, height: targetHeight } = this.currentTarget.getBoundingClientRect();

		return ($event) => {
			this.dragElement.style.pointerEvents = 'none';
			const { left, top, width, height } = this.dragElement.getBoundingClientRect();
			const pointElem = this.document.elementFromPoint(left + (width / 2), top + (height / 2));
			const newDropElement = <HTMLElement> pointElem && pointElem.closest('.map-container-wrapper');
			if (this.dropElement) {
				this.dropElement.style.filter = null;
				this.dropElement.querySelector<HTMLElement>('.active-border').style.height = null;
			}
			this.dropElement = <HTMLElement> newDropElement;
			if (this.dropElement) {
				this.dropElement.style.filter = 'blur(2px)';
				this.dropElement.querySelector<HTMLElement>('.active-border').style.height = '100%';
			}
			this.dragElement.style.transition = null;
			this.dragElement.style.zIndex = '200';
			this.dragElement.style.transform = `translate(${$event.clientX - initialX - (targetWidth / 2)}px, ${$event.clientY - initialY - (targetHeight / 2)}px)`;
		};
	};

	createMouseUp = (mouseMove, mapIds, mapsEntities) => {
		const { left: initialLeft, top: initialTop } = this.dragElement.getBoundingClientRect();
		const mouseUp = () => {
			this.document.body.style.userSelect = null;
			this.dragElement.style.transition = `${this.TRANSITION_DURATION}ms`;
			let mapsList = null;

			if (this.dropElement) {
				const { left: dropLeft, top: dropTop } = this.dropElement.getBoundingClientRect();
				this.dropElement.style.filter = null;
				this.dropElement.style.transition = `${this.TRANSITION_DURATION}ms`;
				this.dropElement.style.transform = `translate(${initialLeft - dropLeft}px, ${initialTop - dropTop}px)`;
				this.dragElement.style.transform = `translate(${dropLeft - initialLeft}px, ${dropTop - initialTop}px)`;
				this.dropElement.style.zIndex = '199';
				const ids = [...mapIds];
				const id1 = this.dragElement.id;
				const id2 = this.dropElement.id;
				const indexOf1 = ids.indexOf(id1);
				const indexOf2 = ids.indexOf(id2);
				ids[indexOf1] = id2;
				ids[indexOf2] = id1;
				mapsList = ids.map((id) => mapsEntities[id]);
				this.dropElement.classList.remove('droppable');
			} else {
				this.dragElement.style.transform = `translate(0, 0)`;
			}
			setTimeout(() => {
				this.dragElement.classList.remove('draggable');
				this.dragElement.style.pointerEvents = null;
				this.dragElement.style.transition = null;
				this.dragElement.style.transform = null;
				this.dragElement.style.zIndex = null;
				if (this.dropElement) {
					this.dropElement.style.transition = null;
					this.dropElement.style.transform = null;
					this.dropElement.style.zIndex = null;
					this.dropElement.querySelector<HTMLElement>('.active-border').style.height = null;
				}
				if (mapsList) {
					this.store.dispatch(new SetMapsDataActionStore({ mapsList }));
				}
				this.dropElement = null;
				this.dragElement = null;
				this.currentTarget = null;
			}, this.TRANSITION_DURATION);

			this.document.removeEventListener('mousemove', mouseMove);
			this.document.removeEventListener('mouseup', mouseUp);
		};

		return mouseUp;
	};
}
