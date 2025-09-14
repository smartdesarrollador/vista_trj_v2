import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicCardTresComponent } from './public-card-tres.component';

describe('PublicCardTresComponent', () => {
  let component: PublicCardTresComponent;
  let fixture: ComponentFixture<PublicCardTresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicCardTresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicCardTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
