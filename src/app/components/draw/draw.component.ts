import {
  Component,
  OnInit,
  Renderer,
  Input,
  EventEmitter,
  Output,
  ElementRef
} from "@angular/core";
import { LoadingController, NavParams, PopoverController } from "@ionic/angular";
//import { NavController, Events } from '@ionic/angular';

//import { Observable } from "rxjs";
//import { finalize, tap } from "rxjs/operators";
import { ModalController, Events } from "@ionic/angular";

//import * as firebase from 'firebase';
import { MessageIntentionComponent } from "../message-intention/message-intention.component";

import 'fabric' ;
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
//import { ActivatedRoute } from '@angular/router';
//import { ChatService } from 'src/app/services/chat.service';
import {ViewChild} from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { ChatService } from 'src/app/services/chat.service';
import { MyImage } from '../../interfaces/image-message';
import { take, tap } from 'rxjs/operators';

declare const fabric: any;
declare var window: any;

@Component({
  selector: "app-draw",
  templateUrl: "./draw.component.html",
  styleUrls: ["./draw.component.scss"]
})
export class DrawComponent implements OnInit {
  @Input() chatId: string;
  @Input() typeOfImg: string;
  @Input() userId: string;
  @Input() messageIntention$: string;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  private path: string;
  private myImage;
  //private msgIntention$: string = "modelling";
  images: Observable<MyImage[]>;
  private imageCollection: AngularFirestoreCollection

  private currentColour: string;
  public availableColours: any;
  private size: number = 5; 
  private tool_selected = "";
  private circle;
  private line;
  private wp: any = "";
  private wpo: any;

  private started = false;
  private x = 0;
  private y = 0;
  private background_visible = false;
  @ViewChild('my_canvas', {static: false}) my_canvas: ElementRef;
  private f_canvas:any;
  private read_json: any;
  drawing: any;
  

  constructor(
     public popoverCtrl: PopoverController,
    public cs: ChatService,
    public us: UploadService,
    private modalController: ModalController,
    private database: AngularFirestore,
    public events: Events,
    
  ) {
    this.availableColours = ["#dd0000", "#000000", "#00dd00", "#ffdd00"];
    //Set collection where our documents/ images info will save
    this.imageCollection = database.collection("images");  
  }

  ngOnInit() {
    this.f_canvas = new fabric.Canvas('my_canvas', {selection: true});
    this.f_canvas.setHeight(window.innerHeight);
    this.f_canvas.setWidth(window.innerWidth);
    this.f_canvas.selection = true;
    this.currentColour = '#000000';
    this.f_canvas.freeDrawingBrush.width = 3; // size of the drawing brush
    this.tool_selected = "selection_tool";
    this.background_visible = false;
    this.load_background();
    let that = this;
    this.f_canvas.on("mouse:down", function(o) {
      that.mousedown(o);
    });
    this.f_canvas.on("mouse:move", function(e) {
      that.mousemove(e);
    });
    this.f_canvas.on("mouse:up", function(e) {
      that.mouseup(e);
    });
    console.log("chatid en draw", this.chatId);
    this.drawing = this.imageCollection.doc(this.chatId).valueChanges();
    this. writeCanvas();
  }
  ionViewDidLoad() {
    
  }
  ngAfterViewInit(){
    
  }
  //para cargar el canvas en firestore
  loadOnCanvas(){
    var json = JSON.stringify(this.f_canvas);
    //console.log("chat id sent to store canvas");
    this.us.addCanvastoDB(json, this.chatId);
    this. writeCanvas();
   }
   async writeCanvas(){
    this.f_canvas.renderAll();
    let that = this;
    console.log("writing canvas");
    this.drawing.pipe(take(1)).subscribe(data=>{
      //this.drawing.pipe(tap(data=>{
        //console.log(data.canvas);
        if(data.canvas){
          that.read_json = data.canvas;
          if(that.read_json){
            this.f_canvas.clear();
            console.log("data loaded");
          //that.canvas1.loadFromJSON(read_json[0]['canvas'],that.canvas1.renderAll.bind(that.canvas1));
          that.f_canvas.loadFromJSON(that.read_json, that.f_canvas.renderAll.bind(that.f_canvas));
          this.f_canvas.renderAll();
          }
        }
      //}));
      });
   }
  load_background() {
    //this.polpDP.dismissLoading();
    //let promise = this.polpDP.getImage(this.afAuth.auth.currentUser.uid, this.polpDP.get_original_image_name());
    /*promise.then(url => {
        this.f_canvas.setBackgroundImage(url, this.f_canvas.renderAll.bind(this.f_canvas), {
            height: window.innerHeight,
            width: window.innerWidth
        });            
    });*/
    if(this.background_visible){
   /* this.f_canvas.setBackgroundImage('./assets/fp-7.jpg', this.f_canvas.renderAll.bind(this.f_canvas), {
      //height: window.innerHeight,
      //width: window.innerWidth,
      scaleX: 0.5,
      scaleY: 0.5,
      selectable: true
  });*/
  let that = this;
  fabric.Image.fromURL('./assets/fp-10.jpg', function(myImg){
    var img = myImg.set({left:20, top:150, selectable: true, scaleX:0.4, scaleY:0.4});
    that.f_canvas.add(img);
    that.f_canvas.sendToBack(img);
    this.loadOnCanvas();
  })
}else{
  //this.f_canvas.setBackgroundImage(0, this.f_canvas.renderAll.bind(this.f_canvas)); 
} 
    
  }
  show_background(){
    
    this.background_visible = !this.background_visible;
    this.load_background();
  }
  mousedown(ob) {
    console.log("mousedown");
    var mouse = this.f_canvas.getPointer(ob.e);
    this.started = true;
    this.x = mouse.x;
    this.y = mouse.y;
    switch (this.tool_selected) {
      case "square":
        var square = new fabric.Rect({
          width: 0,
          height: 0,
          left: this.x,
          top: this.y,
          fill: this.currentColour,
          opacity: 0.6,
          selectable: true
        });
        this.f_canvas.add(square);
        this.f_canvas.renderAll();
        this.f_canvas.setActiveObject(square);
        break;
      case "triangle":
        var triangle = new fabric.Triangle({
          width: 0,
          height: 0,
          left: this.x,
          top: this.y,
          fill: this.currentColour,
          opacity: 0.6,
          selectable: true
        });
        this.f_canvas.add(triangle);
        this.f_canvas.renderAll();
        this.f_canvas.setActiveObject(triangle);
        break;
      case "circle":
        var circle = new fabric.Circle({
          width: 0,
          height: 0,
          left: this.x,
          top: this.y,
          originX: 'left',
          originY: 'top',
          radius: 0,
          fill: this.currentColour,
          //stroke: this.currentColour,
          opacity: 0.6,
          selectable: true
        });
        this.f_canvas.add(circle);
        this.f_canvas.renderAll();
        this.f_canvas.setActiveObject(circle);
        break;
      case "line":
        var line = new fabric.Line({
          width: 0,
          height: 0,
          left: this.x,
          top: this.y,
          stroke: this.currentColour,
          //fill: this.currentColour,
          strokeWidth: 3,
          opacity: 0.6,
          selectable: true
        });
        this.f_canvas.add(line);
        this.f_canvas.renderAll();
        this.f_canvas.setActiveObject(line);
        break;
        case "hand_drawing":
          this.f_canvas.freeDrawingBrush.color = this.currentColour;
          break;
    }

    //this.f_canvas.setActiveObject(square);
  }
  /* Mousemove */
  mousemove(ob) {
    if (!this.started) {
      return false;
    }

    var mouse = this.f_canvas.getPointer(ob.e);

    var w = (mouse.x - this.x),
      h = (mouse.y - this.y);

    if (!w || !h) {
      return false;
    }
    switch (this.tool_selected) {
      case "square":
        var square = this.f_canvas.getActiveObject();
        square.left = this.x;
        square.top = this.y;
        square.x = mouse.x;
        square.y = mouse.y;
        square.set("width", w).set("height", h);
        break;
      case "circle":
        var circle = this.f_canvas.getActiveObject();
        circle.left = this.x;
        circle.top = this.y;
        //circle.set('width', w).set('height', h);
        circle.set("radius", w / 2);
        break;
      case "triangle":
        var triangle = this.f_canvas.getActiveObject();
        triangle.left = this.x;
        triangle.top = this.y;
        triangle.set("width", w).set("height", h);
        break;
      case "line":
        var line = this.f_canvas.getActiveObject();
        line.left = this.x;
        line.top = this.y;
        line.x = mouse.x;
        line.y = mouse.y;
        //line.fill = this.currentColour;
        //line.fill = this.currentColour;
        line.stroke = this.currentColour;
        
        line.set("width", w).set("height", h);
        
        break;
        case "hand_drawing":
          this.f_canvas.freeDrawingBrush.color = this.currentColour;
          break;
    }

    this.f_canvas.renderAll();
  }

  /* Mouseup */
  mouseup(ob) {
    console.log("mouse up")
    if (this.started) {
      this.started = false;
    }
    var mouse = this.f_canvas.getPointer(ob.e);

    var w = (mouse.x - this.x),
      h = (mouse.y - this.y);

    if (!w || !h) {
      return false;
    }
    switch (this.tool_selected) {
      case "square":
        var square = this.f_canvas.getActiveObject();
        //this.f_canvas.add(square);

        break;
      case "circle":
        var circle = this.f_canvas.getActiveObject();
        //this.f_canvas.add(circle);

        break;
      case "triangle":
        var triangle = this.f_canvas.getActiveObject();
        //this.f_canvas.add(triangle);

        break;
      case "line":
        var line = this.f_canvas.getActiveObject();
        //var line = this.f_canvas.getActiveObject();
        //line.left = this.x;
        //line.top = this.y;
        //line.x = mouse.x;
        //line.y = mouse.y;
        //line.fill = this.currentColour;
        //line.stroke = this.currentColour;
        //line.strokeWidth = 3;
        //this.f_canvas.add(line);

        break;
        
    }
    this.f_canvas.renderAll();
    this.loadOnCanvas();
  }

  changeColour(colour) {
    console.log(colour);
    this.currentColour = colour;
    this.f_canvas.freeDrawingBrush.color = this.currentColour;
    //this.draw();
  }

  changeSize(size) {
    this.size = size;
    this.loadOnCanvas();
  }
  draw_rect() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "square";
  }
  draw_triangle() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "triangle";
  }
  draw_circle() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "circle";
  }
  draw_line() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "line";
  }
  draw() {
    this.tool_selected = "hand_drawing";
    
      this.f_canvas.freeDrawingBrush.color = this.currentColour;
     // set brushcolor to black to begin
    this.f_canvas.isDrawingMode = true;
    let that = this;
    //this.f_canvas.freeDrawingBrush.fill = "none";
    this.f_canvas.on("path:created", function(e) {
      //var mouse = that.f_canvas.getPointer(options.e);
      //console.log("path:created");
      var p = e.path;
      p.originX = "left";
      p.originY = "top";
      //p.fill = "none";
      
      //p.opacity = 0.6;
      p.selectable = true;
      //console.log("p.getBoundingRect() ", p.getBoundingRect());
      //that.f_canvas.add(p);
      //  that.f_canvas.renderAll();
        that.f_canvas.setActiveObject(p);      
      //  that.f_canvas.getActiveObject();
    });
  }
  draw_text() {
    this.f_canvas.isDrawingMode = false;
    this.wpo = new fabric.IText(
      "write here... \n;-)",
      {
        fontFamily: "monospace",
        fontSize: 18,
        left: 100,
        top: 100,
        width: 350,
        //fill: this.currentColour,
        textBackgroundColor: "rgba(250,250,250, .7)",
        lineHeight: 1
      }
    );
    
    this.f_canvas.add(this.wpo);
    this.wpo.on("text:editing:exited", function(e) {
      //this works with the latest release build where whatevertext is the name of the object
      console.log("text editing finished");
      this.loadOnCanvas();
  });
  }
  
  select() {
    console.log("selection tool");
    this.tool_selected = "selection_tool";
    this.f_canvas.isDrawingMode = false;
  }
  remove_object() {
    var delete_this = this.f_canvas.getActiveObject();
    this.f_canvas.remove(delete_this);
    this.loadOnCanvas();
  }
  undo_last_object = function() {
    var canvas_objects = this.f_canvas._objects;
    var last = canvas_objects[canvas_objects.length - 1];
    this.f_canvas.remove(last);
    this.f_canvas.renderAll();
    this.loadOnCanvas();
  };
  send_model() {
    let saved_picture = this.f_canvas.toDataURL();
    //console.log("saving edited picture..." + saved_picture);
    //Get the word prolem if it existes
    /*if (this.wpo) {
      this.f_canvas.setActiveObject(this.wpo);
      var txt = this.f_canvas.getActiveObject();
      this.wp = txt.text;
    }*/
    //console.log("subiendo imagen")
    
    // To define the type of the Blob
    //var contentType = "image/png";
    // Split the base64 string in data and contentType
    //var block = saved_picture.split(";");
    // Get the content type
    //var dataType = block[0].split(":")[1];// In this case "image/png"
    // get the real base64 content of the file
    //var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
    //let base64Image = dataType + realData;
    //ESTO ESTABA
    //upload image
    /*this.polpDP.upload_visual_problem(saved_picture, this.afAuth.auth.currentUser.uid);*/
    //upload word problem as text
    //this.polpDP.upload_word_problem(this.wp, this.afAuth.auth.currentUser.uid);
    this.loadOnCanvas();
   this.us.uploadImage(saved_picture, this.chatId, this.messageIntention$);
    this.dismissModal();
   // console.log("this.myImage en draw send_model", this.myImage);
  }
  /*
  async messageIntentionsMenu(evt: any) {
    const popover = await this.popoverCtrl.create({
      component: MessageIntentionComponent,
      event: evt,
      animated: true,
      showBackdrop: true
    });
    let selfi=this;

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
  }*/
  dismissModal() {
    //console.log("dismissing modal");
    //this.myImage = this.us.getImageObject();
    //console.log("this.myImage ", this.myImage);
    /*this.myImage = this.us.getImageObject().then(function(im){
      console.log("this.myImage ", im.data);
    });*/
    //this.send_model();
    /*this.myImage = {
      name: this.us.getName(),
      filepath: pt,
      size: this.us.getSize(),
      chatId: this.chatId
    };*/
    this.modalController.dismiss(
      this.myImage
      //this.msgIntention$
    );
  }
  close() {
    //this.viewCtrl.dismiss();
    this.modalController.dismiss(
      
    );
  }
}
