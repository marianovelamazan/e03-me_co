import { TestBed } from '@angular/core/testing';

import { ReflectService } from './reflect.service';

describe('ReflectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReflectService = TestBed.get(ReflectService);
    expect(service).toBeTruthy();
  });
});
