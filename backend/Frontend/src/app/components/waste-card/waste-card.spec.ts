import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteCard } from './waste-card';

describe('WasteCard', () => {
  let component: WasteCard;
  let fixture: ComponentFixture<WasteCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteCard],
    }).compileComponents();

    fixture = TestBed.createComponent(WasteCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
