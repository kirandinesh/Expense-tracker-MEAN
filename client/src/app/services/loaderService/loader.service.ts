import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  mainLoader$ = new BehaviorSubject<boolean>(false);
  constructor(private spinner: NgxSpinnerService) {}
  show() {
    this.spinner.show();
    this.mainLoader$.next(true);
  }

  hide() {
    this.spinner.hide();
    this.mainLoader$.next(false);
  }
}
