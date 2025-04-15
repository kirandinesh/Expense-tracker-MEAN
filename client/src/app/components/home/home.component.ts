import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuth().subscribe({
      next: (res) => {
        console.log('User is authenticated:', res);
      },
      error: (err) => {
        this.authService.logOutService();
      },
    });
  }
  changeMenu() {
    this.authService.changeMenuState$.next('closed');
   
  }
}
