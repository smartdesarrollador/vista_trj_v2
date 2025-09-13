import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuturisticCardComponent } from './futuristic-card.component';

describe('FuturisticCardComponent', () => {
  let component: FuturisticCardComponent;
  let fixture: ComponentFixture<FuturisticCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuturisticCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuturisticCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
