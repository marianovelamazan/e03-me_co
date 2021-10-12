import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, Events } from '@ionic/angular';

@Component({
  selector: 'app-message-intention',
  templateUrl: './message-intention.component.html',
  styleUrls: ['./message-intention.component.scss'],
})
export class MessageIntentionComponent implements OnInit {
  page: any;
  
  constructor(
    private events: Events,
    private navParams: NavParams,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.page = this.navParams.get('data');
  }
  anonymous(){
    this.events.publish('msgIntention', "anonymous");
    this.popoverController.dismiss();
  }
  info(){
    this.events.publish('msgIntention', "info");
    this.popoverController.dismiss();
  }
  proposal(){
    this.events.publish('msgIntention', "proposal");
    this.popoverController.dismiss();
  }
  modelling(){
    this.events.publish('msgIntention', "modelling");
    this.popoverController.dismiss();
  }
  presenting(){
    this.events.publish('msgIntention', "presenting");
    this.popoverController.dismiss();
  }
  checking(){
    this.events.publish('msgIntention', "checking");
    this.popoverController.dismiss();
  }
  dismissModal() {
    
    this.popoverController.dismiss(
      
    );
  }
/*
  eventFromPopover() {
    this.events.publish('msgIntention');
    this.popoverController.dismiss();
  }
*/
}
