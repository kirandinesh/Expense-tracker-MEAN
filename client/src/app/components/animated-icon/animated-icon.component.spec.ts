import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedIconComponent } from './animated-icon.component';

describe('AnimatedIconComponent', () => {
  let component: AnimatedIconComponent;
  let fixture: ComponentFixture<AnimatedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimatedIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
