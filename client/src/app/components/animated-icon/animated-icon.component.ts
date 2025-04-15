import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-animated-icon',
  standalone: false,
  templateUrl: './animated-icon.component.html',
  styleUrl: './animated-icon.component.css',
})
export class AnimatedIconComponent implements OnChanges {
  @Input() path: string = '';
  options: AnimationOptions = {
    path: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['path'] && changes['path'].currentValue) {
      this.options = {
        path: this.path,
      };
    }
  }

  animationCreated(animationItem: AnimationItem): void {
   
  }

  constructor() {
    
  }
}
