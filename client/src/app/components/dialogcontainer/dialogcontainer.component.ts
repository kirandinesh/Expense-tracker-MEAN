import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../services/authService/auth.service';
import { DashbordService } from '../../services/dashboardService/dashbord.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
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
    fullName: new FormControl('', [Validators.required]),
    userName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_]{3,16}$'),
    ]),
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
    private toasterService: ToastrService,
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
    console.log(this.userUpdateData.value, 'update');

    this.authService.updateUser(this.userUpdateData.value).subscribe({
      next: (res) => {
        console.log(res, 'updated');
        this.toasterService.success(res?.message);
        this.userDialogData.userData.fullName = res.data.fullName;
        this.userDialogData.userData.userName = res.data.userName;
        this.isUpdating = false;
        this.isEdit = false;
      },
      error: (err) => {
        console.log(err);
        this.isUpdating = false;

        const errorMessage = err?.error?.message || 'Something went wrong';

        if (errorMessage === 'Username is already taken') {
          this.userUpdateData.get('userName')?.setErrors({ duplicate: true });
        }

        this.toasterService.error(errorMessage);
      },
    });
  }

  deleteUser() {
    this.isDeleting = true;
    this.authService.deleteUserService().subscribe({
      next: (res: any) => {
        this.toasterService.success(res?.message);
        this.isDeleting = false;
        this.dialog.closeAll();
        this.dialog.afterAllClosed.subscribe(() => {
          this.authService.logOutService();
        });
      },
      error: (err) => {
        this.isDeleting = false;
        const errorMessage = err?.error?.message || 'Something went wrong';
        this.toasterService.error(errorMessage);
      },
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogcontainerComponent, {
      data: { isHeader: false, isDelete: true },
    });
  }
}
