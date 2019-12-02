import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArIpComponent } from './ar-ip.component';

describe('ArIpComponent', () => {
  let component: ArIpComponent;
  let fixture: ComponentFixture<ArIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
