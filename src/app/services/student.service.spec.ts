import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Student } from '../models/student.model';
import { StudentService } from './student.service';

describe('StudentService', () => {
  const students: Student[] = [
    {
      id: 1,
      name: 'Maya Hassan',
      faculty: 'Engineering',
      classYear: 2028,
      quote: 'Build things.',
      photo: 'maya.jpg',
      featured: true,
    },
    {
      id: 2,
      name: 'Adam Schneider',
      faculty: 'Informatics',
      classYear: 2028,
      quote: 'Curiosity first.',
      photo: 'adam.jpg',
      featured: false,
    },
  ];
  let service: StudentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    http = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it('GETs the student list and emits the response after 400 ms', async () => {
    const received = vi.fn();
    service.getStudents().subscribe(received);
    const request = http.expectOne({ method: 'GET', url: 'mock-api/students.json' });
    request.flush(students);

    await vi.advanceTimersByTimeAsync(399);
    expect(received).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(received).toHaveBeenCalledExactlyOnceWith(students);
  });

  it('passes an HTTP 500 error to the caller', async () => {
    const result = firstValueFrom(service.getStudents());
    const rejected = expect(result).rejects.toMatchObject({ status: 500 });
    http.expectOne('mock-api/students.json').flush('Boom', {
      status: 500,
      statusText: 'Server Error',
    });

    await rejected;
  });
});
