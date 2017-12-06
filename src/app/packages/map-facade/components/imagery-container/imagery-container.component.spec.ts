import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryContainerComponent } from './imagery-container.component';
import { MockComponent } from '@ansyn/core/test';
import { CoreModule } from '@ansyn/core/core.module';
import { StoreModule } from '@ngrx/store';
import { ImageryRotationComponent } from '../imagery-rotation/imagery-rotation.component';

describe('ImageryContainerComponent', () => {
	let component: ImageryContainerComponent;
	let fixture: ComponentFixture<ImageryContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				StoreModule.forRoot({})
			],
			declarations: [
				ImageryContainerComponent,
				MockComponent({
					selector: 'ansyn-imagery-view',
					inputs: ['mapComponentSettings']
				}),
				ImageryRotationComponent
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryContainerComponent);
		component = fixture.componentInstance;
		component.mapState = {} as any;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
