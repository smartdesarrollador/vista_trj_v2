import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BannerCarouselComponent } from '../../../shared/banner-carousel/banner-carousel.component';
import { DigitalCardComponent } from '../../../components/digital-card/digital-card.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet, BannerCarouselComponent, DigitalCardComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {}
