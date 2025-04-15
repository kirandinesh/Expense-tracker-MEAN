import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { LoaderService } from './services/loaderService/loader.service';
import { IdleServiceService } from './services/idle-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';
  isLoading: boolean = false;
  rupeeIconPath: string = '/assets/animations/rupeesIcons.json';
  constructor(
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private idleService: IdleServiceService
  ) {}
  ngOnInit(): void {
    this.loaderService.mainLoader$.subscribe((res) => {
      this.isLoading = res;
      this.cdRef.detectChanges();
    });
  }
}
