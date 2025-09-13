import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuturisticCardPageComponent } from './futuristic-card-page.component';

describe('FuturisticCardPageComponent', () => {
  let component: FuturisticCardPageComponent;
  let fixture: ComponentFixture<FuturisticCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuturisticCardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuturisticCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
