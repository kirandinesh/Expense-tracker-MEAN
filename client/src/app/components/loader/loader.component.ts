import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: false,
  template: `
    <div
      class="loader border-t-2 rounded-full border-yellow-500 bg-yellow-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"
    >
      $
    </div>
  `,
  styles: ``,
})
export class LoaderComponent {}
