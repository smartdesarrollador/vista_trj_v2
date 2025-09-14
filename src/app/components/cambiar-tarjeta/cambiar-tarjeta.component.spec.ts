import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarTarjetaComponent } from './cambiar-tarjeta.component';

describe('CambiarTarjetaComponent', () => {
  let component: CambiarTarjetaComponent;
  let fixture: ComponentFixture<CambiarTarjetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarTarjetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarTarjetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
