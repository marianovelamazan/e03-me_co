import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PoLPsComponent } from './po-lps.component';

describe('PoLPsComponent', () => {
  let component: PoLPsComponent;
  let fixture: ComponentFixture<PoLPsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoLPsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PoLPsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
