import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../services/authService/auth.service';
import { DashbordService } from '../../services/dashboardService/dashbord.service';
@Component({
  selector: 'app-dialogcontainer',
  standalone: false,
  templateUrl: './dialogcontainer.component.html',
  styleUrl: './dialogcontainer.component.css',
})
export class DialogcontainerComponent {
  isEdit: boolean = false;
  isUpdating: boolean = false;
  isDeleting: boolean = false;
  totalExpenseAdded: number = 0;
  userUpdateData = new FormGroup({
    fullName: new FormControl(''),
    userName: new FormControl('', [Validators.pattern('^[a-zA-Z0-9_]{3,16}$')]),
  });
  binIconPath: string = '/assets/animations/bin.json';
  readonly dialog = inject(MatDialog);
  constructor(
    @Inject(MAT_DIALOG_DATA) public pieChartData: any,
    @Inject(MAT_DIALOG_DATA) public barChartData: any,
    @Inject(MAT_DIALOG_DATA) public userDialogData: any,
    @Inject(MAT_DIALOG_DATA) public deleteuserDialogData: any,
    private authService: AuthService,
    private dashboardService: DashbordService,
    private dialogRef: MatDialogRef<DialogcontainerComponent>
  ) {
    this.dashboardService.fetchAllExpensesServices().subscribe({
      next: (res: any) => {
        this.totalExpenseAdded = res?.data?.expenses.length || 0;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  toggleEdit() {
    this.userUpdateData
      .get('fullName')
      ?.setValue(this.userDialogData.userData.fullName);

    this.userUpdateData
      .get('userName')
      ?.setValue(this.userDialogData.userData.userName);
    this.isEdit = !this.isEdit;
  }
  submitEdit() {
    this.isUpdating = true;
    this.authService.updateUser(this.userUpdateData.value).subscribe({
      next: (res) => {
        console.log(res, 'updated');
        this.isUpdating = false;
        this.isEdit = false;
      },
      error: (err) => {
        console.log(err);
        this.isUpdating = false;
      },
    });
  }
  deleteUser() {
    this.isDeleting = true;
    this.authService.deleteUserService().subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.authService.logOutService();
      },
      error: (err) => {
        console.log(err);
        this.isDeleting = false;
      },
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogcontainerComponent, {
      data: { isHeader: false, isDelete: true },
    });
  }
}
