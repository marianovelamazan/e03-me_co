import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { CalculatorComponent } from '../calculator/calculator.component';
import { DrawComponent } from '../draw/draw.component';
import { UploadPictureComponent } from '../upload-picture/upload-picture.component';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnInit {
  @Input() chatId: string;
  @Input() msgIntention$: string;
  @Input() userId: string;
  
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  private calculatorMsg: any;
  public msgIntentionStarter$: string;
  newMsg: any;
  imageMsg: any;
  typeOfMsgExplanation$: string;

  constructor(
    private modalController: ModalController,
    public cs: ChatService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    switch(this.msgIntention$){
      case "proposal":{
        this.msgIntentionStarter$ = "I have an idea...";
        this.typeOfMsgExplanation$ = "share with your group an idea, a proposal or your own theory about something"
        break;
      }
      case "question":{
        this.msgIntentionStarter$ = "I am not sure I understand...";
        this.typeOfMsgExplanation$ = "ask your team mates about what you didn´t understand or if you need more explanations for"
        break;
      }
      case "info":{
        this.msgIntentionStarter$ = "I have read/checked/found that...";
        this.typeOfMsgExplanation$ = "this type of message is about data or facts you know for sure because you have checked them somewhere"
        break;
      }
      case "anonymous":{
        this.msgIntentionStarter$ = "...";
        this.typeOfMsgExplanation$ = "noone will know that you wrote this message so feel free to say whatever you think it is going to be good"
        break;
      }
      case "emotional":{
        this.msgIntentionStarter$ = "we are a great team!";
        this.typeOfMsgExplanation$ = "Try to keep a good atmosphere:"
        break;
      }
    }
  }
  submitImage() {
    
    console.log("this.msgIntention$ ", this.msgIntention$);
    this.cs.sendImageMessage(this.chatId, this.imageMsg, "image", this.msgIntention$);
    this.imageMsg = "";
    //PARA INCREMENTAR PUNTOS DE TIPOS DE MENSAJES (VIENE COPIADO DE LA PÁGINA DE CHAT, VER AHÍ)
    //this.ps.incrementarPuntos(this.msgIntention$);
    //this.scrollBottom();
  }
  async showDrawingPicture() {
    //console.log("this.chatId sent to drawing app",this.chatId);
    
    const modal = await this.modalController.create({
      component: DrawComponent,
      componentProps: {
        'chatId': this.chatId,
        'messageIntention$': this.msgIntention$
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.imageMsg = data['data']; // Here's your data!
        
        //console.log("self.imageMsg ", self.imageMsg, data);
        this.cancelModal();
        //this.msgIntention$ = data.role;
        //this.ps.incrementarPuntos(this.msgIntention$);
    //this.scrollBottom();

    });
    
    return await modal.present();
  }
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
        //this.msgIntention$ = data.role;
        if(typeof self.imageMsg !== 'undefined'){
          this.submitImage();
          this.cancelModal();
        }

    });
    return await modal.present();
  }
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
        console.log("self.imageMsg ", self.imageMsg);
        //this.msgIntention$ = data.role;
        console.log("this.msgIntention$ ", this.msgIntention$);
        if(typeof self.imageMsg!=='undefined'){
          this.submitImage();
          this.cancelModal();
        }

    });
    return await modal.present();
  }
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
        //this.msgIntention$ = "checking";
        console.log("self.calculatorMsg ", self.calculatorMsg, " - ", data.role);
        if(typeof self.newMsg!=='undefined'){
          //this.submit(this.chatId);
          this.modalController.dismiss(this.msgIntentionStarter$+" "+this.newMsg);
        }
    });
    return await modal.present();
   }
  cancelModal() {
    this.newMsg = null;
      this.modalController.dismiss();
    
  }
  dismissModal() {
    if(this.newMsg != undefined){
      //console.log("no es undefined")
      this.modalController.dismiss(this.msgIntentionStarter$+" "+this.newMsg);
    }else{
      this.modalController.dismiss();
    }
    
  }
}
