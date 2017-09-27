import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import * as d3 from 'd3';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { TimelineComponent } from './timeline.component';
import { DebugElement } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


describe('TimelineComponent', () => {
	let component: TimelineComponent;
	let fixture: ComponentFixture<TimelineComponent>;
	let timeLineEmitterService: TimelineEmitterService;
	let de: DebugElement;


	const dropsData = [{
		'name': 'admin-on-rest',
		'data': [{
			'sha': 'ad4a690c2708e11156e24534e01238df16b07f23',
			'message': 'Merge-pull-request-19-from-marmelab-jpetitcolas-patch-1',
			'author': { 'name': 'Francois Zaninotto', 'email': 'fzaninotto@gmail.com' },
			'date': 'Wed, 7 Sep 2016 12:04:14 +0200'
		}, {
			'sha': '8110e85434d4cc87212dc5d8534e3e1069e174c2',
			'message': 'Doc-how-to-use-dev-version-in-real-world-project',
			'author': { 'name': 'Jonathan Petitcolas', 'email': 'petitcolas.jonathan@gmail.com' },
			'date': 'Wed, 7 Sep 2016 11:16:40 +0200'
		}]
	}, {
		'name': 'demo',
		'data': [{
			'sha': '412a71481f94e845cb1e920616136a9221b91c17',
			'message': 'Update-watch-target',
			'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' },
			'date': 'Thu, 22 Jan 2015 13:13:56 +0100'
		}, {
			'sha': 'ae145441f60e9475e19de37d44b4842260af7d08',
			'message': 'Use-browserify',
			'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' },
			'date': 'Thu, 22 Jan 2015 12:28:22 +0100'
		}, {
			'sha': '2040299a8fe6c586a702382b50a63d7abb8fcff3',
			'message': 'Rename-to-restful.js',
			'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' },
			'date': 'Thu, 22 Jan 2015 09:03:39 +0100'
		}, {
			'sha': 'eea59ff38abb348fd71ec4716250f21fc94edd0f',
			'message': 'first-commit',
			'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' },
			'date': 'Wed, 21 Jan 2015 14:07:20 +0100'
		}]
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [TimelineEmitterService],
			declarations: [TimelineComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimelineComponent);
		component = fixture.componentInstance;
		component.redraw$ = new BehaviorSubject(Math.random());
		fixture.detectChanges();
	});

	beforeEach(inject([TimelineEmitterService], (_timelineEmitterService) => {
		timeLineEmitterService = _timelineEmitterService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('dots markup process', () => {

		const moveToFront = {
			moveToFront: () => {
			}, classed: () => {
				return {
					style: () => {
					}
				};
			}, style: () => {
			}
		};

		spyOn(document, 'querySelector').and.callFake(value => document.createElement('circle'));
		spyOn(moveToFront, 'moveToFront');
		spyOn(d3, 'selectAll').and.callFake(() => moveToFront);

		component.markup = [{
			id: 'eea59ff38abb348fd71ec4716250f21fc94edd0f',
			class: 'active'
		}, { id: '2040299a8fe6c586a702382b50a63d7abb8fcff3', class: 'displayed' }];

		expect(document.querySelector).toHaveBeenCalledWith('circle[data-id="eea59ff38abb348fd71ec4716250f21fc94edd0f"]');
		expect(document.querySelector).toHaveBeenCalledWith('circle[data-id="2040299a8fe6c586a702382b50a63d7abb8fcff3"]');
		// expect(moveToFront.moveToFront).toHaveBeenCalledTimes(1);

	});

	it('should check that click was called instead of double click', fakeAsync(() => {
		const event = component.clickEvent();
		const data = {
			id: '100'
		};

		function createElement(className) {
			const element = document.createElement('div');
			element.classList.add(className);
			return element;
		}

		const list = createElement('list');
		list.appendChild(createElement('test1'));
		list.appendChild(createElement('test2'));
		document.body.appendChild(list);
		expect(document.querySelector('.list')['childNodes'].length).toBe(2);

		const handler = spyOn(timeLineEmitterService, 'provide').and.returnValue(new Subject());

		spyOn(d3, 'event').and.returnValue({});
		let mouseEventResult = { clientX: 10, clientY: 15 } as MouseEvent;
		event({ key: 'value' }, 1, list.childNodes, mouseEventResult);
		tick(400);
		expect(timeLineEmitterService.provide).toHaveBeenCalledWith('timeline:click');

		event({ key: 'value' }, 1, list.childNodes, mouseEventResult);
		tick(150);
		event({ key: 'value' }, 1, list.childNodes, mouseEventResult);
		expect(timeLineEmitterService.provide).toHaveBeenCalledWith('timeline:dblclick');

		tick(500);
		timeLineEmitterService.provide['calls'].reset();


		mouseEventResult = { clientX: 20, clientY: 20 } as MouseEvent;
		event({ key: 'value' }, 1, list.childNodes, mouseEventResult);
		tick(150);

		mouseEventResult = { clientX: 200, clientY: 200 } as MouseEvent;
		event({ key: 'value' }, 1, list.childNodes, mouseEventResult);
		expect(timeLineEmitterService.provide).not.toHaveBeenCalledWith('timeline:click');
		expect(timeLineEmitterService.provide).not.toHaveBeenCalledWith('timeline:dblclick');

	}));

	it('update drops variable will call eventDrops method', () => {
		spyOn(component, 'eventDropsHandler');
		component.drops = dropsData;
		expect(component.eventDropsHandler).toHaveBeenCalled();
	});

	it('the view is working after initiliazing', () => {

		const svg = fixture.nativeElement.querySelector('svg');
		expect(svg).toBeNull();
		component.drops = dropsData;
		fixture.detectChanges();
		const svg2 = fixture.nativeElement.querySelector('svg');
		expect(svg2).not.toBe(null);

		// de.nativeElement
	});

	it('check that the drops are installed properly', () => {
		component.drops = dropsData;
		fixture.detectChanges();
		const svg = fixture.nativeElement.querySelector('svg');
		const lines = svg.querySelectorAll('.drop-line');
		expect(lines.length).toEqual(component.drops.length);
	});


});
