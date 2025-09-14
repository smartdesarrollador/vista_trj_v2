import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalCardTresComponent } from './digital-card-tres.component';

describe('DigitalCardTresComponent', () => {
  let component: DigitalCardTresComponent;
  let fixture: ComponentFixture<DigitalCardTresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalCardTresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalCardTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
