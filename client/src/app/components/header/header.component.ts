import { Component, inject, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from '../../services/authService/auth.service';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogcontainerComponent } from '../dialogcontainer/dialogcontainer.component';
import { LoaderService } from '../../services/loaderService/loader.service';
import { DashbordService } from '../../services/dashboardService/dashbord.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('openClose', [
      state(
        'closed',
        style({
          height: '0',
          opacity: 0,
          overflow: 'hidden',
          padding: '0',
          margin: '0',
          display: 'none',
        })
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          display: 'flex',
        })
      ),
      transition('closed <=> open', animate('0.4s  ease-in-out')),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  isOpen: boolean = false;
  menuState: 'open' | 'closed' = 'closed';

  userData = {};
  totalExpensesAdded: number = 0;

  avatarIconPath: string = '/assets/animations/avatar.json';
  profileIconPath: string = '/assets/animations/profile.json';

  constructor(
    private authService: AuthService,
    private dashboardService: DashbordService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((res) => {
      this.authService.isLoggedIn();
    });
    this.authService.changeMenuState$.subscribe((res) => {
      this.menuState = res;
    });

    this.authService.fetchUser().subscribe({
      next: (res) => {
        this.userData = res?.data;
        console.log(this.userData, 'check user');
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.dashboardService.fetchAllExpensesServices().subscribe({
      next: (res: any) => {
        this.totalExpensesAdded = res?.data?.expenses.length || 0;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  openDialog() {
    this.dialog.open(DialogcontainerComponent, {
      data: {
        userData: this.userData,
        isHeader: true,
        totalExpensesAdded: this.totalExpensesAdded,
      },
    });
  }

  hadleLogout() {
    this.authService.logOutService();
    this.authService.isLoggedIn$.next(false);
  }
  onMenuClick() {
    this.isOpen = !this.isOpen;
    this.menuState = this.isOpen ? 'open' : 'closed';
  }
  handleAddExpense() {
    this.router.navigate(['home/add-expense']);
  }
}
