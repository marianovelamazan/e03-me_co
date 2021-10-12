import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Emotion } from 'src/app/interfaces/image-message';
import { AuthService } from 'src/app/services/auth.service';
import { MonitorService } from 'src/app/services/monitor.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent implements OnInit {
  public userProfile$: any;
  public userEmotions$: Observable<Emotion[]>;
  //public chatid$: string;
  @Input() chatId$: string;
  @Input() userId$: string;
  @Input() user_photo$: string;
  @Input() user_name$: string;
 
  emotionsId: any;
  user_photo: any;
  constructor(
    private afs: AngularFirestore,
    public ms: MonitorService,
    private route: ActivatedRoute,
    public auth: AuthService,
    private ps: ProfileService,
    private modalController: ModalController
  ) { 
    //this.emotionsId = this.ms.getChatEmotionId(this.chatId$);
  }

  async ngOnInit() {
    
    this.userEmotions$ = this.ms.getUserEmotions(this.userId$,this.chatId$);
   
  }
  getUser(u){
    return this.user_photo = this.ps.getUserProfileById(u);
  }
  cancelModal() {
    
      this.modalController.dismiss();
    
  }
  dismissModal() {
    
      this.modalController.dismiss();
        
  }
}
