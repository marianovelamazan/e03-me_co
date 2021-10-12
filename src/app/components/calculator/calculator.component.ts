import { Component, OnInit } from "@angular/core";
import { isNumber } from "util";
import { IonicModule, ModalController, PopoverController, Events } from '@ionic/angular';
import { MessageIntentionComponent } from '../message-intention/message-intention.component';

@Component({
  selector: "app-calculator",
  templateUrl: "./calculator.component.html",
  styleUrls: ["./calculator.component.scss"]
})
export class CalculatorComponent implements OnInit {
  private calculatorMsg: string;
  private msgIntention$: string = "checking";
  constructor(
    private modalCalcController: ModalController,
    public popoverCtrl: PopoverController,
    public events: Events,
  ) {}

  ngOnInit() {}
  value = "0";
  oldValue = "0";

  lastOperator = "x";
  readyForNewInput = true;
  numberGroups = [
    [7, 8, 9, "*"],
    [4, 5, 6, "-"],
    [1, 2, 3, "+"],
    [0, "c", "/", "="]
  ];

  onButtonPress(symbol) {
    //console.log(symbol);

    if (isNumber(symbol)) {
      //console.log("is a number");
      if (this.readyForNewInput) this.value = "" + symbol;
      else this.value += "" + symbol;
      this.readyForNewInput = false;
    } else if (symbol === "c") {
      this.value = "0";
      this.readyForNewInput = true;
    } else if (symbol === "=") {
      //console.log("mensaje: ", this.oldValue," ", this.lastOperator, " ", this.value," = ");
      this.calculatorMsg = this.oldValue+" "+ this.lastOperator+ " "+ this.value+" = ";
      if (this.lastOperator === "*")
        this.value = "" + parseInt(this.oldValue) * parseInt(this.value);
      else if (this.lastOperator === "-")
        this.value = "" + (parseInt(this.oldValue) - parseInt(this.value));
      else if (this.lastOperator === "+")
        this.value = "" + (parseInt(this.oldValue) + parseInt(this.value));
      else if (this.lastOperator === "/")
        this.value = "" + parseInt(this.oldValue) / parseInt(this.value);
      this.readyForNewInput = true;
      this.calculatorMsg = this.calculatorMsg + this.value;
    } else {
      // operator
      this.readyForNewInput = true;
      this.oldValue = this.value;
      this.lastOperator = symbol;
      //this.calculatorMsg = "";
    }
  }
  async messageIntentionsMenu(evt: any) {
    const popover = await this.popoverCtrl.create({
      component: MessageIntentionComponent,
      event: evt,
      animated: true,
      showBackdrop: true
    });
    let selfi=this;
    /** Sync event from popover component */
    this.events.subscribe("msgIntention", msgType => {
      //this.syncTasks();
      //console.log("msg type en image component", event, msgType);
      selfi.msgIntention$ = msgType;
      //this.send_model(msgType);
    });
    const self = this;
    
    popover.onDidDismiss()
      .then((data) => {
        //this.isUploading = this.isUploaded = false; 
        //console.log("data ",data);  
        this.dismissModal();
        
    });
    return await popover.present();
  }
  dismissModal() {
    console.log("this.calculatorMsg en calculator", this.calculatorMsg);
  this.modalCalcController.dismiss(
    this.calculatorMsg
  );
  }
  cancelCalcModal() {
    this.calculatorMsg = null;
    this.modalCalcController.dismiss();
    
  }
}
