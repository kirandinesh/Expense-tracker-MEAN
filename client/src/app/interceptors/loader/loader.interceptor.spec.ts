import { TestBed } from '@angular/core/testing';

import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LoaderInterceptor } from './loader.interceptor';
import { LoaderService } from '../../services/loaderService/loader.service';

describe('LoaderInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let loaderService: LoaderService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoaderService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoaderInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loaderService = TestBed.inject(LoaderService);
    spyOn(loaderService, 'show').and.callThrough();
    spyOn(loaderService, 'hide').and.callThrough();
  });

  it('should show or hide spinner', () => {
    httpClient.get('/api/config').subscribe();
    expect(loaderService.show).toHaveBeenCalled();
    const req = httpTesting.expectOne('/api/config');
    req.flush({});
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should handle errors ', () => {
    httpClient.get('/api/config').subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    expect(loaderService.show).toHaveBeenCalled();
    const req = httpTesting.expectOne('/api/config');
    req.flush('Error Occured', { status: 500, statusText: 'Server Error' });
    expect(loaderService.hide).toHaveBeenCalled();
  });
});
