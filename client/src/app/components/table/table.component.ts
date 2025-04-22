import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Expense } from '../../config/expense';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DashbordService } from '../../services/dashboardService/dashbord.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tableElement') tableElement!: ElementRef;
  getTableElement() {
    return this.tableElement;
  }

  newHeaders: string[] = [];
  isDeleting: boolean = false;
  @Input() dataSource: Expense[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() dataList: any[] = [];

  @Input() headers: string[] = [];
  @Input() isDemo: boolean = true;

  @Input() isExpense: boolean = false;

  @Input() expenseList!: MatTableDataSource<any>;

  constructor(
    private dashboardService: DashbordService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (this.expenseList && this.paginator) {
      this.expenseList.paginator = this.paginator;
    }
  }

  ngOnInit(): void {
    this.newHeaders = [...this.headers, 'Action'];
  }

  onDelete(id: string) {
    this.isDeleting = true;
    this.dashboardService.deleteExpenseService(id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        console.log(res);
        const updatedData = this.expenseList.data.filter(
          (expense: any) => expense._id !== id
        );
        this.expenseList.data = updatedData;
      },
      error: (err) => {
        console.log(err);
        this.isDeleting = false;
      },
    });
    console.log(id, 'delete');
  }

  onEdit(id: string) {
    this.router.navigateByUrl(`home/edit-expense/${id}`);
  }
}
