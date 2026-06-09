import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskChangeStatusDialogComponent } from './task-change-status-dialog.component';

describe('TaskChangeStatusDialogComponent', () => {
  let component: TaskChangeStatusDialogComponent;
  let fixture: ComponentFixture<TaskChangeStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskChangeStatusDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskChangeStatusDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
