import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class IdleServiceService implements OnDestroy {
  private timeoutId: any;
  private readonly timeout: number = 60 * 60 * 1000; // 1 hour
  private readonly events = [
    'click',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
  ];
  private readonly boundResetFn = this.resetTimer.bind(this);

  constructor(private router: Router, private ngZone: NgZone) {
    this.initListener();
    this.resetTimer();
  }

  private initListener(): void {
    this.events.forEach((event) =>
      window.addEventListener(event, this.boundResetFn)
    );
  }

  private resetTimer(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => this.logout());
      }, this.timeout);
    });
  }

  private logout(): void {
    sessionStorage.removeItem('accessToken');
    this.router.navigate(['/auth']);
    alert('You have been logged out due to inactivity.');
  }

  ngOnDestroy(): void {
    this.events.forEach((event) =>
      window.removeEventListener(event, this.boundResetFn)
    );
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
