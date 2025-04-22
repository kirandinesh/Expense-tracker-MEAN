import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DashbordService } from '../../services/dashboardService/dashbord.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexXAxis,
} from 'ng-apexcharts';
import { MatDialog } from '@angular/material/dialog';
import { DialogcontainerComponent } from '../../components/dialogcontainer/dialogcontainer.component';
import { displayedColumns } from '../../config/expense';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableComponent } from '../../components/table/table.component';
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(TableComponent) childComponent!: TableComponent;

  readonly dialog = inject(MatDialog);

  pieChartIconPath: string = '/assets/animations/pi-chart.json';
  barChartIconPath: string = '/assets/animations/barChart.json';
  nonOfExpenseIconPath: string = '/assets/animations/noOfExpense.json';
  rupeeIconPath: string = '/assets/animations/rupeesIcons.json';
  dateIconPath: string = '/assets/animations/date.json';

  tableHeader = displayedColumns || [];
  firstExpenseDate: string = '';
  lastExpenseDate: string = '';
  totalExpenseAmount: number = 0;
  totalExpenseAdded: number = 0;

  isChartLoading: boolean = false;
  isPieChartLoading: boolean = false;

  expenseList!: MatTableDataSource<any>;
  filteredExpenseList = [];
  selectedExpenseDate: Date | null = null;
  dateControl = new FormControl<Date | null>(null);
  exportType = new FormControl('');

  chartData = [];

  chartLegent: ApexLegend = {
    position: 'top',
    horizontalAlign: 'center',
  };
  chartSeries: ApexNonAxisChartSeries = [];
  barChartSeries: ApexAxisChartSeries = [
    {
      name: 'basic',
      data: [],
    },
  ];
  chartLables = [];
  chartBarCategories = [];
  chartXaxis: ApexXAxis = {};

  chartTitle: ApexTitleSubtitle = {
    text: 'Category Summary',
    align: 'left',
  };
  barChartTitle: ApexTitleSubtitle = {
    text: 'Expense Monthly Summary',
    align: 'left',
  };
  chartDataLabels: ApexDataLabels = {
    enabled: false,
  };

  chartDetails: ApexChart = {
    type: 'donut',
    toolbar: {
      show: true,
    },
    height: 350,
    width: 350,
    foreColor: '#b0d4c2',
  };

  chartResponsive: ApexResponsive[] = [
    {
      breakpoint: 768,
      options: {
        chart: {
          width: 350,
          height: 350,
        },
      },
    },
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 260,
          height: 260,
        },
      },
    },
    {
      breakpoint: 300,
      options: {
        chart: {
          width: 250,
          height: 250,
        },
      },
    },
  ];

  chartDetailsBar: ApexChart = {
    type: 'bar',
    toolbar: {
      show: true,
    },
    height: 350,
    width: 500,
    foreColor: '#b0d4c2',
  };

  constructor(
    private dashboardService: DashbordService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.fetchExpenseList();
    this.loadChart();
  }

  onExportTypeChange(event: MatSelectChange) {
    if (event.value === 'pdf') {
      this.downloadAsPDF();
    } else if (event.value === 'csv') {
      this.downloadAsCSV();
    }
  }

  get filteredExpenseLists() {
    if (!this.selectedExpenseDate) {
      return this.expenseList;
    }
    return this.filteredExpenseList;
  }

  downloadAsPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['name', 'amount', 'expenseDate', 'category', 'paymentType', 'notes'],
      ],
      body: (this.filteredExpenseLists instanceof MatTableDataSource
        ? this.filteredExpenseLists.data
        : this.filteredExpenseLists
      ).map((expenses: any) => [
        expenses.name,
        expenses.amount,
        new Date(expenses.expenseDate).toLocaleDateString('en-CA'),
        expenses.category,
        expenses.paymentType,
        expenses.notes,
      ]),
    });

    doc.save('expense_report.pdf');
  }

  downloadAsCSV() {
    let csvContent = 'name,	amount,	expenseDate,	category,	paymentType,	notes\n';
    (this.filteredExpenseLists instanceof MatTableDataSource
      ? this.filteredExpenseLists.data
      : this.filteredExpenseLists
    ).forEach((expenses) => {
      csvContent += `${expenses.name},${expenses.amount},${new Date(
        expenses.expenseDate
      ).toLocaleDateString('en-CA')},${expenses.category},${
        expenses.paymentType
      },${expenses.notes}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'expense-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearDate() {
    this.dateControl.setValue(null);
    this.exportType.setValue(null);
    this.selectedExpenseDate = null;
    this.fetchExpenseList();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.selectedExpenseDate = event.value;

    if (this.selectedExpenseDate) {
      const isoDate = this.selectedExpenseDate.toLocaleDateString();
      console.log('ISO Date:', isoDate);
      console.log();
    }
    this.fetchExpenseList();
  }

  handleAddExpense() {
    this.router.navigateByUrl('/home/add-expense');
  }

  openDialog() {
    const pieChartData = {
      chartDetails: this.chartDetails,
      chartSeries: this.chartSeries,
      chartLables: this.chartLables,
      chartTitle: this.chartTitle,
      chartLegent: this.chartLegent,
      chartDataLabels: this.chartDataLabels,
      chartResponsive: this.chartResponsive,
      selectedChartType: 'pie',
    };

    const dialogRef = this.dialog.open(DialogcontainerComponent, {
      data: pieChartData,
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('Dialog result:', res);
    });
  }

  openBarDialog() {
    const barChartData = {
      barChartSeries: this.barChartSeries,
      chartLegent: this.chartLegent,
      chartDetailsBar: this.chartDetailsBar,
      barChartTitle: this.barChartTitle,
      chartXaxis: this.chartXaxis,
      chartResponsive: this.chartResponsive,
      selectedChartType: 'bar',
    };
    const dialogRef = this.dialog.open(DialogcontainerComponent, {
      data: barChartData,
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('Dialog result:', res);
    });
  }

  fetchExpenseList() {
    this.dashboardService.fetchAllExpensesServices().subscribe({
      next: (res: any) => {
        this.firstExpenseDate = res?.data?.firstExpenseCreatedAt || '-';
        this.lastExpenseDate = res?.data?.lastExpenseCreatedAt || '-';
        this.totalExpenseAmount = res?.data?.totalExpense || 0;
        this.totalExpenseAdded = res?.data?.expenses.length || 0;
        const data = res?.data?.expenses || [];
        console.log(data, 'dataaa');

        this.filteredExpenseList = data.filter((expense: any) => {
          const expenseDate = new Date(expense.expenseDate).toLocaleDateString(
            'en-CA'
          );
          const selectedDate =
            this.selectedExpenseDate?.toLocaleDateString('en-CA');
          return selectedDate ? expenseDate === selectedDate : true;
        });

        console.log(this.filteredExpenseList, 'filter');

        this.expenseList = new MatTableDataSource(
          this.selectedExpenseDate ? this.filteredExpenseList : data
        );
        this.expenseList.paginator = this.paginator;
        this.chartData = res.data.expenses;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  loadChart() {
    this.isChartLoading = true;
    this.isPieChartLoading = true;
    this.dashboardService.getCategorySummaryService().subscribe({
      next: (res) => {
        this.chartSeries = res.categories.map((r: any) => r.total) || [];
        this.chartLables = res.categories.map((r: any) => r.name) || [];

        this.isChartLoading = false;
      },
      error: (err) => {
        this.isChartLoading = false;
      },
    });

    this.dashboardService.getMonthlySummaryService().subscribe({
      next: (res) => {
        this.barChartSeries[0].data = res.months.map((r: any) => r.total) || [];
        this.chartXaxis = {
          categories: res.months.map((r: any) => r.month) || [],
        };
        this.isPieChartLoading = false;
      },
      error: (err) => {
        this.isPieChartLoading = false;
      },
    });
  }
}
