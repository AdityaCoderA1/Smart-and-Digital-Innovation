import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecyclingGuide } from './recycling-guide';

describe('RecyclingGuide', () => {
  let component: RecyclingGuide;
  let fixture: ComponentFixture<RecyclingGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecyclingGuide],
    }).compileComponents();

    fixture = TestBed.createComponent(RecyclingGuide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
