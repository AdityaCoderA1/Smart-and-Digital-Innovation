import {
  Component,
  AfterViewInit,
  ElementRef
} from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {

  constructor(private el: ElementRef){}

  ngAfterViewInit(): void {

    const elements =
      this.el.nativeElement.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if(entry.isIntersecting){

            entry.target.classList.add('active');

          }

        });

      },

      {
        threshold: 0.15
      }

    );

    elements.forEach((element: Element) => {

      observer.observe(element);

    });

  }

}