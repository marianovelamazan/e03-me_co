import { Component, OnInit } from "@angular/core";
import { ChatService } from "../../services/chat.service";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { MessageIntentionComponent } from "../message-intention/message-intention.component";
import { PopoverController, Events } from "@ionic/angular";
//import { PopoverComponent } from '../../component/popover/popover.component';
import { ModalController } from '@ionic/angular';
import { UploadFormComponent } from '../upload-form/upload-form.component';
import { UploadPictureComponent } from '../upload-picture/upload-picture.component';
import {ViewChild} from '@angular/core';
import { IonContent } from "@ionic/angular";
import { ProfileService } from '../../services/profile.service';
import { DrawComponent } from '../draw/draw.component';
import { CalculatorComponent } from '../calculator/calculator.component';
import { TextComponent } from '../text/text.component';
import {TeamService} from "../../services/team.service";
import {ActivitiesService} from "../../services/activities.service";
import { MemberComponent } from "../member/member.component";
import { MonitorService } from "src/app/services/monitor.service";
//import { toNamespacedPath } from "path";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit {
  chat$: Observable<any>;
  newMsg: string;
  public msgIntention$;
  public showMessage$ = false;
  public msgSelected$;
  photoproblemIsVisible$: boolean = false;
  private chatId;
  imageMsg: any;
  public typeOfImg: string = "picture";
  public calculatorIsVisible$: boolean = false;
  

  @ViewChild('IonContent', {static: false}) content: IonContent;
  private calculatorMsg: any;
  users$: any;
  showAllMessages$: boolean = true;
  proposalMsg: any;
  anonymousMsg:any;
  questionMsg: any;
  infoMsg: any;
    teamName: any;
    activity: any;
  negative_emotions: any[]=[];
  //ESTO ESTA AQUÏ PORQUE SE UTILIZA EN EL ARCHIVO HTML PERO NO SE UTILIZA
  public trackByUid;
  emotionalMsg: any;
  constructor(
    public cs: ChatService,
    public ms: MonitorService,
    private route: ActivatedRoute,
    public auth: AuthService,
    public popoverCtrl: PopoverController,
    private events: Events,
    private teamSevice: TeamService,
    public modalController: ModalController,
    public activityService: ActivitiesService,
    private ps: ProfileService
  ) {
      this.route.queryParams.subscribe(params => {
          this.teamName = params['teamName'];
          const activityId = params['activity'];
          this.getActivityData(activityId);
      });
  }
  getActivityData(activityId) {
      this.activityService.get(activityId).subscribe((res: any) => {
          console.log('activity', res);
          this.activity = res;
      })
  }
  ngOnInit() {
    //AQUI IBAN const chatId y source
    this.chatId = this.route.snapshot.paramMap.get("id");
    //console.log(this.chatId, 'this.chatId');
    const source = this.cs.get(this.chatId);
    this.chat$ = this.cs.joinUsers(source);
      // this.chat$.subscribe(async (res: any) => {
      //     console.log(res);
      //     if(res) {
      //         this.users$ =
      //     }
      let self=this;
      this.teamSevice.activeTeamMembersObserver.subscribe((members: any) => {
          this.users$ = members;
          this.users$.forEach(u => {
            this.getNegativeEmotions(u);
            
          });
      });
      
  }
  getNegativeEmotions(u){
    const results = [];
    var negative_emotions=0;
    var number_of_emotions=0;

    this.ms.getNegativeEmotions(u, this.chatId).forEach(doc => {
      doc.forEach(emotion => {
        const id = emotion.payload.doc.data().opinions;
        
        results.push(id);
        results.forEach( (element) => {
          //element.product_desc = element.product_desc.substring(0,10);
          element.forEach(em => {
            if (u == em.uid){
              
              if((em.valence=="positive" && em.value<5) || (em.valence=="negative" && em.value>5)){
                negative_emotions++;
                
              }
              number_of_emotions++;
            }
            //console.log("doc.data() ", u, em.valence);
          })
          console.log("negative emotion", negative_emotions);
          let e = {u, negative_emotions};
              console.log("em ", u, negative_emotions);
              this.negative_emotions.push(e);
              console.log(" this.negative_emotions ",  this.negative_emotions[0].negative_emotions)
          return negative_emotions;
      })
       
      })
  
    });
  }
  getMsgClass(i, msg_int){
    //console.log("i", i);
    if((i%2== 0) && msg_int!="anonymous"){
      return "user-col" ;
    }
  }
  
  ionViewDidEnter(){
    this.scrollBottom();
  }
  showAllMessages(){
    this.showAllMessages$ = !this.showAllMessages$;
  }
  showMessage(msgId){

    this.msgSelected$ = msgId;
    this.showMessage$ = !this.showMessage$;
  }
  hideMessage(msgId){

    this.msgSelected$ = '';
    this.showMessage$ = false;
  }
  submit(chatId) {
    if(!this.msgIntention$){
      this.msgIntention$ = "info"
    }
    this.cs.sendMessage(chatId, this.newMsg, this.msgIntention$);
    this.newMsg = "";
    this.ps.incrementarPuntos(this.msgIntention$);
    this.scrollBottom();
    //console.log("sending...");
  }
/*
  submitImage() {
    this.cs.sendImageMessage(this.chatId, this.imageMsg, "image", this.msgIntention$);
    this.imageMsg = "";
    this.ps.incrementarPuntos(this.msgIntention$);
    this.scrollBottom();
  }
*/
  trackByCreated(i, msg) {
    return msg.createdAt;
  }
  trackByUser(i, u) {
    return u.uid;
  }
  public scrollBottom() {

    setTimeout(() => {
      if (this.content.scrollToBottom) {
          this.content.scrollToBottom(1000);
      }
  }, 1000);

    console.log("scrolling: ");
  }
/*
  async messageIntentionsMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MessageIntentionComponent,
      event: ev,
      animated: true,
      showBackdrop: true
    });

    this.events.subscribe("msgIntention", msgType => {
      this.msgIntention$ = msgType;
      //this.submit(this.chatId);
    });
    return await popover.present();
  }
*/
  photoproblemVisibility(){
      if(this.activity) {
          this.photoproblemIsVisible$ = !this.photoproblemIsVisible$;
      }
  }
/*
 async showCalculator(){
  const modal = await this.modalController.create({
    component: CalculatorComponent,
    componentProps: {
      'chatId': this.chatId,
    },
    cssClass: "calculator-modal",
    showBackdrop:true,
  });
  const self = this;
  modal.onDidDismiss()
    .then((data) => {
      self.calculatorMsg = "A ver qué os parecen estos cálculos: " + data['data']; // Here's your data!
      this.newMsg = self.calculatorMsg;
      this.msgIntention$ = "checking";
      console.log("self.calculatorMsg ", self.calculatorMsg, " - ", data.role);
      if(this.msgIntention$){
        this.submit(this.chatId);
      }
  });
  return await modal.present();
 }
 */
 async showProposal(){
   this.msgIntention$ = "proposal";
  const modal = await this.modalController.create({
    component: TextComponent,
    componentProps: {
      'chatId': this.chatId,
      'msgIntention$': this.msgIntention$
    },
    cssClass: "text-modal",
    showBackdrop:true,
  });
  const self = this;
  modal.onDidDismiss()
    .then((data) => {
      self.proposalMsg = data['data']; // Here's your data!
      this.newMsg = self.proposalMsg;
      this.msgIntention$ = "proposal";
      //console.log("self.proposalMsg ", self.proposalMsg, " data role ", data.role);
      if(typeof self.proposalMsg !== 'undefined'){
        this.submit(this.chatId);
      }
  });
  this.scrollBottom();
  return await modal.present();
 }
 async showQuestion(){
  this.msgIntention$ = "question";
 const modal = await this.modalController.create({
   component: TextComponent,
   componentProps: {
     'chatId': this.chatId,
     'msgIntention$': this.msgIntention$
   },
   cssClass: "text-modal",
   showBackdrop:true,
 });
 const self = this;
 modal.onDidDismiss()
   .then((data) => {
     self.proposalMsg = data['data']; // Here's your data!
     this.newMsg = self.proposalMsg;
     this.msgIntention$ = "question";
     console.log("self.questionMsg ", self.questionMsg, " - ", data.role);
     if(typeof self.proposalMsg !== 'undefined'){
       this.submit(this.chatId);
     }
 });
 this.scrollBottom();
 return await modal.present();
}
async showInfo(){
  this.msgIntention$ = "info";
 const modal = await this.modalController.create({
   component: TextComponent,
   componentProps: {
     'chatId': this.chatId,
     'msgIntention$': this.msgIntention$
   },
   cssClass: "text-modal",
   showBackdrop:true,
 });
 const self = this;
 modal.onDidDismiss()
   .then((data) => {
     self.proposalMsg = data['data']; // Here's your data!
     this.newMsg = self.proposalMsg;
     this.msgIntention$ = "info";
     //console.log("self.infoMsg ", self.infoMsg, " - ", data.role);
     if(typeof  this.newMsg !== 'undefined'){
       this.submit(this.chatId);
     }
 });
 this.scrollBottom();
 return await modal.present();
}
 async showAnonymous(){
  this.msgIntention$ = "anonymous";
 const modal = await this.modalController.create({
   component: TextComponent,
   componentProps: {
     'chatId': this.chatId,
     'msgIntention$': this.msgIntention$
   },
   cssClass: "text-modal",
   showBackdrop:true,
 });
 const self = this;
 modal.onDidDismiss()
   .then((data) => {
     self.anonymousMsg = data['data']; // Here's your data!
     this.newMsg = self.anonymousMsg;
     this.msgIntention$ = "anonymous";
     console.log("self.anonymousMsg ", self.anonymousMsg, " - ", data.role);
     if(typeof this.newMsg !== 'undefined'){
       this.submit(this.chatId);
     }
 });
 this.scrollBottom();
 return await modal.present();
}

async showEmotional(){
  this.msgIntention$ = "emotional";
 const modal = await this.modalController.create({
   component: TextComponent,
   componentProps: {
     'chatId': this.chatId,
     'msgIntention$': this.msgIntention$
   },
   cssClass: "text-modal",
   showBackdrop:true,
 });
 const self = this;
 modal.onDidDismiss()
   .then((data) => {
     self.emotionalMsg = data['data']; // Here's your data!
     this.newMsg = self.emotionalMsg;
     this.msgIntention$ = "emotional";
     console.log("self.emotionalMsg ", self.emotionalMsg, " - ", data.role);
     if(typeof this.newMsg !== 'undefined'){
       this.submit(this.chatId);
     }
 });
 this.scrollBottom();
 return await modal.present();
}

/*
  async showUploadForm() {
    const modal = await this.modalController.create({
      component: UploadFormComponent,
      componentProps: {
        'chatId': this.chatId,
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.imageMsg = data['data']; // Here's your selected user!
        //console.log("data form modal",data, self.imageMsg)
        this.submitImage();
    });

    return await modal.present();
  }
  */
 /*
  async showUploadPicture() {

    const modal = await this.modalController.create({
      component: UploadPictureComponent,
      componentProps: {
        'chatId': this.chatId,
        'typeOfImg': 'picture'
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.imageMsg = data['data']; // Here's your data!
        this.msgIntention$ = data.role;
        if(typeof self.imageMsg !== 'undefined'){
          this.submitImage();
        }

    });
    return await modal.present();
  }
  */
  /*
  async showUploadCameraPicture() {

    const modal = await this.modalController.create({
      component: UploadPictureComponent,
      componentProps: {
        'chatId': this.chatId,
        'typeOfImg': 'camera'
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.imageMsg = data['data']; // Here's your data!
        this.msgIntention$ = data.role;
        if(typeof self.imageMsg!=='undefined'){
          this.submitImage();
        }

    });
    return await modal.present();
  }
  */
  
  async showMemberEmotions(u, p, n){
    console.log("u, p, n", u, p, n);
   const modal = await this.modalController.create({
     component: MemberComponent,
     componentProps: {
       'chatId$': this.chatId,
       'userId$': u,
       'user_photo$': p,
       'user_name$': n
     },
     cssClass: "text-modal",
     showBackdrop:true,
   });
   const self = this;
   modal.onDidDismiss()
     .then((data) => {
       //self.proposalMsg = data['data']; // Here's your data!
       //this.newMsg = self.proposalMsg;
       //this.msgIntention$ = "info";
       console.log("self.infoMsg ", u, " - ", this.ms.getEmotions());
       /*if(typeof  this.newMsg !== 'undefined'){
         this.submit(this.chatId);
       }*/
   });
   return await modal.present();
  }
}
