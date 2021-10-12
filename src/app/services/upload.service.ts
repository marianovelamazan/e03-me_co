import { Injectable } from "@angular/core";
import {
  AngularFireUploadTask,
  AngularFireStorage
} from "@angular/fire/storage";
import { Observable } from "rxjs";
import {
  AngularFirestoreCollection,
  AngularFirestore
} from "@angular/fire/firestore";
//import { NavParams } from '@ionic/angular';
import { finalize, tap, map } from "rxjs/operators";
import { MyImage } from "../interfaces/image-message";

import { ChatService } from './chat.service';

@Injectable({
  providedIn: "root"
})
export class UploadService {
  private path: string;
  private myImage;
  private msgIntention$;
  // Upload Task
  task: AngularFireUploadTask;

  // Progress in percentage
  percentage: Observable<number>;

  // Snapshot of uploading file
  snapshot: Observable<any>;

  // Uploaded File URL
  public UploadedFileURL: Observable<string>;

  //File details
  fileName: string;
  fileSize: number;

  //Status check
  isUploading: boolean;
  isUploaded: boolean;
  //Uploaded Image List
  images: Observable<MyImage[]>;
  private imageCollection: AngularFirestoreCollection<MyImage>;
  private chatId;
  private userId;
  filePath: string;
  constructor(
    private database: AngularFirestore,
    public cs: ChatService,
    private storage: AngularFireStorage //private navParams: NavParams
  ) {
    this.imageCollection = database.collection<MyImage>("images");
    this.images = this.imageCollection.valueChanges();

    this.isUploading = false;
    this.isUploaded = false;
  }
  async uploadImage(img: any, chatid: string, msgType: string) {
    // The File object
    const file = img;
    //console.log("uploading image in service");
    //console.log("file",file, img);
    // Validation for Images Only
    /*if (file.type.split("/")[0] !== "image") {
      console.error("unsupported file type :( ");
      return;
    }*/
    this.chatId = chatid;
    //this.userId = uid;
    this.isUploading = true;
    this.isUploaded = false;
    this.fileName = this.generateUUID();
    //this.fileName = this.generateUUID();;
    //console.log("name ",this.fileName);

    // The storage path
    if (this.chatId != null) {
      this.path = `chatImagesStorage/${new Date().getTime()}_${
        this.fileName
      }.jpg`;
      console.log("this.path ", this.path);
      // Totally optional metadata
      
    } else if (this.userId != null) {
      this.path = `profileImagesStorage/${new Date().getTime()}_${
        this.fileName
      }.jpg`;
    }
    //console.log("this.path; ", this.userId, this.path);
    const customMetadata = { app: this.chatId };
    //File reference
    const fileRef = this.storage.ref(this.path);
    // The main task
    //this.task = this.storage.upload(this.path, img, { customMetadata });
    let that = this;
    fileRef.putString(img, "data_url").then(function(snapshot) {
      //console.log('Uploaded a data_url string!!', snapshot.ref.getDownloadURL().then(function(downloadURL) {
        //console.log('File available at', downloadURL);
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          that.fileSize = snapshot.totalBytes;
        that.myImage = {
          name: that.fileName,
          filepath: downloadURL,
          size: that.fileSize,
          chatId: that.chatId
        };
        that.msgIntention$ = msgType;
        that.addImagetoDB(that.myImage);
        //console.log("that.myImage ", that.myImage);
        return that.myImage;
      });

  });
  
  }
  private generateUUID(): string {
    // Implementation
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }
  getImageObject() {
    return this.myImage;
  }
  /*
  public getName(){
    
    return this.fileName;

  }
  async getPath(){
    if(this.filePath){
      let pt = this.filePath.then(function(p){

      });
    }
  }
   getSize(){
    if(this.fileSize){
    return  this.fileSize;
    }
  }*/
  addImagetoDB(image: MyImage) {
    //Create an ID for document
    const id = this.database.createId();
    //console.log("new id: ", id)
    //Set document id with value in database
    this.imageCollection
      .doc(id)
      .set(image)
      .then(resp => {
        console.log("resp", resp);
        //return image;
        this.cs.sendImageMessage(this.chatId, image, "image", this.msgIntention$);
    //this.imageMsg = "";
      })
      .catch(error => {
        console.log("error " + error);
      });
  }
  addCanvastoDB(canvas: any, chatId:string) {
    //Create an ID for document
    //const id = this.database.createId();
    console.log("chat id added: ", chatId);
    //Set document id with value in database
    this.imageCollection
      .doc(chatId)
      .set({canvas: canvas, chatid: chatId},
        { merge: true })
      .then(resp => {
        console.log("resp", resp);
        //return image;
        //this.cs.sendImageMessage(this.chatId, image, "image", this.msgIntention$);
    //this.imageMsg = "";
      })
      .catch(error => {
        console.log("error " + error);
      });
  }
  drawCanvas(chatid) {
    /*
     */
    return this.database
      .collection("images", ref => ref)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: Object = a.payload.doc.data();
            console.log("canvas? ", data[0]['canvas'])
            return { id: a.payload.doc.id, ...data };
            //
          });
        })
      );
  }
}
