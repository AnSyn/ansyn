import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { DebugElement } from '@angular/core';
import * as d3 from 'd3/dist/d3';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { State, Store, StoreModule } from '@ngrx/store';
import { OverlaysEffects } from '../../effects/overlays.effects';
import { Actions } from '@ngrx/effects';
import { OverlaysService } from '../../services/overlays.service';
import { MultipleOverlaysSourceProvider } from '../../services/multiple-source-provider';
import { createStore, IStoreFixture } from '../../../core/test/mock-store';
import { LoggerService } from '../../../core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('TimelineComponent', () => {
	let component: TimelineComponent;
	let fixture: ComponentFixture<TimelineComponent>;
	let storeFixture: IStoreFixture<IOverlaysState>;
	let store: Store<IOverlaysState>;
	let state: State<{ overlays: IOverlaysState }>;
	let overlaysEffects: OverlaysEffects;
	let overlaysService: OverlaysService;
	let getState: () => IOverlaysState;
	let de: DebugElement;
	let config: {
		locale: {
			'dateTime': '%x, %X',
			'date': '%-m/%-d/%Y',
			'time': '%-I:%M:%S %p',
			'periods': ['AM', 'PM'],
			'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		bound: {
			location: '-35'
		},
		margin: {
			top: 60,
			left: 10,
			bottom: 40,
			right: 10
		},
		line: {
			color: (d, i) => null
		},
		label: {
			width: 0,
			padding: 0,
			text: ''
		},
		range: {
			start: null,
			end: null
		},
		drop: null,
		zoom: null,
		d3: d3
	};

	const rawData = [{
		'name': 'admin-on-rest',
		'data': [{
			'id': 'ad4a690c2708e11156e24534e01238df16b07f23',
			'otherData': {
				'message': 'Merge-pull-request-19-from-marmelab-jpetitcolas-patch-1',
				'author': { 'name': 'Francois Zaninotto', 'email': 'fzaninotto@gmail.com' }
			},
			'date': 'Wed, 7 Sep 2016 12:04:14 +0200'
		}, {
			'id': '8110e85434d4cc87212dc5d8534e3e1069e174c2',
			'otherData': {
				'message': 'Doc-how-to-use-dev-version-in-real-world-project',
				'author': { 'name': 'Jonathan Petitcolas', 'email': 'petitcolas.jonathan@gmail.com' }
			},
			'date': 'Wed, 7 Sep 2016 11:16:40 +0200'
		}
		]
	}, {
		'name': 'demo',
		'data': [{
			'id': '412a71481f94e845cb1e920616136a9221b91c17',
			'otherData': {
				'message': 'Update-watch-target',
				'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' }
			},
			'date': 'Thu, 22 Jan 2015 13:13:56 +0100'
		}, {
			'id': 'ae145441f60e9475e19de37d44b4842260af7d08',
			'otherData': {
				'message': 'Use-browserify',
				'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' }
			},
			'date': 'Thu, 22 Jan 2015 12:28:22 +0100'
		}, {
			'id': '2040299a8fe6c586a702382b50a63d7abb8fcff3',
			'otherData': {
				'message': 'Rename-to-restful.js',
				'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' }
			},
			'date': 'Thu, 22 Jan 2015 09:03:39 +0100'
		}, {
			'id': 'eea59ff38abb348fd71ec4716250f21fc94edd0f',
			'otherData': {
				'message': 'first-commit',
				'author': { 'name': 'Robin Bressan', 'email': 'robin@buddey.net' }
			},
			'date': 'Wed, 21 Jan 2015 14:07:20 +0100'
		}
		]
	}
	];

	const dropsData = [{
		name: rawData[0].name,
		data: rawData[0].data.map(testDrop => {
			return { ...testDrop, date: new Date(testDrop.date) };
		})
	}
	];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: OverlaysService,
					useValue: {}
				},
				OverlaysEffects,
				Actions,
				{
					provide: MultipleOverlaysSourceProvider,
					useValue: {}
				},
				{
					provide: LoggerService,
					useValue: { error: (some) => null }
				},
				{
					provide: TranslateService,
					useValue: {}
				}
			],
			declarations: [TimelineComponent],
			imports: [
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }),
				TranslateModule
			]
		})
			.compileComponents();

		storeFixture = createStore(OverlayReducer);
		store = storeFixture.store;
		getState = storeFixture.getState;
		state = <State<any>>storeFixture.state; // (overlaysInitialState);
	}));


	beforeEach(() => {
		fixture = TestBed.createComponent(TimelineComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});


	beforeEach(inject([OverlaysService], (_overlaysService) => {
		overlaysService = _overlaysService;
	}));
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});



