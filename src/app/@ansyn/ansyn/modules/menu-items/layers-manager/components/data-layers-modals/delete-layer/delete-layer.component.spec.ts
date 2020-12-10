import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { DeleteLayerComponent } from './delete-layer.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DeleteLayerComponent', () => {
	let component: DeleteLayerComponent;
	let fixture: ComponentFixture<DeleteLayerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [DeleteLayerComponent],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeleteLayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
