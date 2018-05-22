import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeViewComponent } from './tree-view.component';
import { StoreModule } from '@ngrx/store';

describe('TreeViewComponent', () => {
	let component: TreeViewComponent;
	let fixture: ComponentFixture<TreeViewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TreeViewComponent],
			imports: [StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

});
