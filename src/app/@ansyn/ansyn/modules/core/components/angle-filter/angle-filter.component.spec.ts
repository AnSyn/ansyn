import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { OverlayReducer, overlaysFeatureKey } from '../../../overlays/reducers/overlays.reducer';
import { AngleFilterComponent } from './angle-filter.component';
describe('AngleFilterComponent', () => {
	let component: AngleFilterComponent;
	let fixture: ComponentFixture<AngleFilterComponent>;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AngleFilterComponent],
			imports: [
				StoreModule.forRoot({[overlaysFeatureKey]: OverlayReducer})
			],
			providers: [
				provideMockActions(() => actions)
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AngleFilterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
