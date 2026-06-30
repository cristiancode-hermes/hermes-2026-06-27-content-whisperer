import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be initially empty', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a toast after show()', () => {
    service.show('Test message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Test message');
    expect(toasts[0].type).toBe('info');
  });

  it('should auto-dismiss after timeout', () => {
    vi.useFakeTimers();
    service.show('Auto dismiss');
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(3000);

    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should accept custom type parameter', () => {
    service.show('Error message', 'error');
    expect(service.toasts()[0].type).toBe('error');

    service.show('Warning message', 'warning');
    expect(service.toasts()[1].type).toBe('warning');

    service.show('Success message', 'success');
    expect(service.toasts()[2].type).toBe('success');
  });

  it('should add sequential IDs', () => {
    service.show('First');
    service.show('Second');
    service.show('Third');

    const toasts = service.toasts();
    expect(toasts[0].id).toBe(0);
    expect(toasts[1].id).toBe(1);
    expect(toasts[2].id).toBe(2);
  });
});
