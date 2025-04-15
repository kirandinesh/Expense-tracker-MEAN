import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Expense } from '../../config/expense';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashbordService {
  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  addExpenseService(formData: Expense) {
    return this.http.post(`${environment.expenseApiUrl}/add-expense`, formData);
  }

  addCategoryService(formData: string[]) {
    return this.http.post(`${environment.categoryApiUrl}/add-category`, {
      categoryText: formData,
    });
  }
  fetchCategoryService() {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${environment.categoryApiUrl}/get-category`
    );
  }

  updateCategoryService(formData: string[]) {
    return this.http.put(`${environment.categoryApiUrl}/update-category`, {
      categoryText: formData,
    });
  }

  fileUploadService(formData: FormData) {
    return this.http.post(
      `${environment.expenseApiUrl}/import-expense`,
      formData
    );
  }

  fetchAllExpensesServices() {
    return this.http.get(`${environment.expenseApiUrl}/get-expense`);
  }

  getCategorySummaryService(): Observable<any> {
    return this.http.get(`${environment.expenseApiUrl}/summary/category`);
  }

  getMonthlySummaryService(): Observable<any> {
    return this.http.get(`${environment.expenseApiUrl}/summary/monthly`);
  }

  deleteExpenseService(id: string) {
    return this.http.delete(
      `${environment.expenseApiUrl}/delete-expense/${id}`
    );
  }

  updateExpenseService(id: string, formData: Expense) {
    return this.http.put(
      `${environment.expenseApiUrl}/edit-expense/${id}`,
      formData
    );
  }
  fetchExpenseByIdService(id: string): Observable<any> {
    return this.http.get(`${environment.expenseApiUrl}/get-expense/${id}`);
  }
}
