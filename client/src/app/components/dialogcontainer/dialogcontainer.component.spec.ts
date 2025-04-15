import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogcontainerComponent } from './dialogcontainer.component';

describe('DialogcontainerComponent', () => {
  let component: DialogcontainerComponent;
  let fixture: ComponentFixture<DialogcontainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogcontainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogcontainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
