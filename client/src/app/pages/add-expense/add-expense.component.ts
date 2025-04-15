import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DEFAULT_CATEGORIES,
  displayedColumns,
  Expense,
  EXPENSE_TABLE_DATA,
  paymentMode,
} from '../../config/expense';
import { DashbordService } from '../../services/dashboardService/dashbord.service';
import Papa from 'papaparse';
import { MatStepper } from '@angular/material/stepper';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

type Mode = 'manual' | 'csv';
@Component({
  selector: 'app-add-expense',
  standalone: false,
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css',
})
export class AddExpenseComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/animations/upload_completed.json',
  };
  animationCreated(animationItem: AnimationItem): void {
    
  }
  modeSelector: Mode = 'manual';
  editMode: boolean = false;

  isLoading: boolean = false;
  isUpdating: boolean = false;
  isExpenseEdit: boolean = false;
  expenseId: string = '';

  dataList: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;

  displayedColumns = displayedColumns;
  dataSource = EXPENSE_TABLE_DATA;
  addExpenseForm = new FormGroup({
    name: new FormControl('', Validators.required),
    amount: new FormControl(0, [Validators.required, Validators.min(0)]),
    expenseDate: new FormControl('', Validators.required),
    category: new FormControl(null, Validators.required),
    paymentType: new FormControl(null, Validators.required),
    notes: new FormControl(''),
  });
  categoryArray: string[] = [];
  paymentModeArray = paymentMode;
  addCategoryForm = new FormGroup({
    categoryText: new FormControl(''),
  });
  isUploadingFile: boolean = false;
  isUploadingFileCompleted: boolean = false;
  updateExpenseFormData = [];

  @ViewChild('stepper') stepper!: MatStepper;
  constructor(
    private dashboardService: DashbordService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCategory();
    this.checkEditMode();
    this.isExpenseEdit && this.fetchExpenseByID();
  }

  fetchExpenseByID() {
    this.dashboardService.fetchExpenseByIdService(this.expenseId).subscribe({
      next: (res) => {
        console.log(res.data, 'fetchExpenseByIdService');
        this.addExpenseForm.get('name')?.setValue(res.data.name);
        this.addExpenseForm.get('amount')?.setValue(res.data.amount);
        this.addExpenseForm.get('expenseDate')?.setValue(res.data.expenseDate);
        this.addExpenseForm.get('category')?.setValue(res.data.category);
        this.addExpenseForm.get('paymentType')?.setValue(res.data.paymentType);
        this.addExpenseForm.get('notes')?.setValue(res.data.notes);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  private checkEditMode(): void {
    const path = this.location.path();
    console.log('Path:', path);
    path.includes('home/edit-expense')
      ? (this.isExpenseEdit = true)
      : (this.isExpenseEdit = false);

    console.log(this.isExpenseEdit, 'editmode');

    this.route.params.subscribe({
      next: (res: any) => {
        console.log(res.expenseId, 'routeparams');
        this.expenseId = res.expenseId || '';
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  uploadReset() {
    this.stepper.reset();
    this.dataList = [];
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    if (!file.type.includes('csv')) {
      console.error('Please upload a CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.dataList = result.data;
        this.headers = result.meta.fields || [];
        this.stepper.next();
        this.selectedFile = file;
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });

    event.target.value = '';
  }

  uploadCSVFile(): void {
    if (!this.selectedFile) {
      console.warn('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('csv', this.selectedFile, this.selectedFile.name);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log(formData, 'formData');

    this.isUploadingFile = true;
    this.isUploadingFileCompleted = false;

    this.dashboardService.fileUploadService(formData).subscribe({
      next: (response) => {
        console.log(response, 'upload csv');

        this.dataList = [];
        this.selectedFile = null;
        this.stepper.reset();

        this.stepper.selectedIndex = 0;
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.isUploadingFile = false;
      },
      complete: () => {
        this.isUploadingFile = false;
        this.isUploadingFileCompleted = true;

        setTimeout(() => {
          this.isUploadingFileCompleted = false;
          this.stepper.reset();
        }, 3000);
      },
    });
  }

  fetchCategory() {
    this.dashboardService.fetchCategoryService().subscribe({
      next: (res) => {
        this.categoryArray = res.data || [];
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  changeMode(modeName: Mode) {
    this.modeSelector = modeName;
  }

  handleAddExpense() {
    if (this.addExpenseForm.valid) {
      const expenseData: Expense = this.addExpenseForm.value as Expense;
      this.isLoading = true;
      this.isExpenseEdit
        ? this.dashboardService
            .updateExpenseService(this.expenseId, expenseData)
            .subscribe({
              next: (res) => {
                console.log(res);

                this.isLoading = false;
                this.addExpenseForm.reset();
                this.addExpenseForm.markAsUntouched();
                this.addExpenseForm.markAsPristine();
                this.router.navigate(['home/dashboard']);
              },
              error: (err) => {
                console.log(err);
              },
            })
        : this.dashboardService.addExpenseService(expenseData).subscribe({
            next: (res) => {
              this.isLoading = false;
              this.addExpenseForm.reset();
              this.addExpenseForm.markAsUntouched();
              this.addExpenseForm.markAsPristine();
            },
            error: (err) => {
              console.log(err);
            },
          });
    }
  }

  handleAddCategory() {
    if (this.addCategoryForm.valid) {
      this.isUpdating = true;

      const categoryValue: string[] =
        this.addCategoryForm.get('categoryText')?.value?.split(',') || [];

      const filteredCategories = categoryValue.filter(
        (val) => !DEFAULT_CATEGORIES.includes(val)
      );

      this.dashboardService.addCategoryService(filteredCategories).subscribe({
        next: (res) => {
          this.isUpdating = false;

          this.fetchCategory();

          this.addCategoryForm.reset();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  handleResetExpense() {
    this.addExpenseForm.reset();
  }

  handleEditCategory() {
    this.editMode = !this.editMode;
    const ctrl = this.addCategoryForm.get('categoryText');
    this.editMode ? ctrl?.disable() : ctrl?.enable();
  }

  handleUpdateCategory() {
    this.isUpdating = true;
    const updatedCategoryArray = this.categoryArray || [];

    if (updatedCategoryArray) {
      this.dashboardService
        .updateCategoryService([...updatedCategoryArray])
        .subscribe({
          next: (res) => {
            this.isUpdating = false;
            this.editMode = false;
            this.addCategoryForm.get('categoryText')?.enable();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }
  deleteCategory(index: number) {
    this.categoryArray = this.categoryArray.filter((_, i) => i !== index);
  }
  get isCategoryEmpty(): boolean {
    const value = this.addCategoryForm.get('categoryText')?.value || '';
    return value.trim() === '';
  }

  getControllName(controlName: string) {
    return this.addExpenseForm.get(controlName);
  }
}
