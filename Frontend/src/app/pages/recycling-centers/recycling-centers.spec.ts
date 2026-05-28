import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecyclingCenters } from './recycling-centers';

describe('RecyclingCenters', () => {
  let component: RecyclingCenters;
  let fixture: ComponentFixture<RecyclingCenters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecyclingCenters],
    }).compileComponents();

    fixture = TestBed.createComponent(RecyclingCenters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
