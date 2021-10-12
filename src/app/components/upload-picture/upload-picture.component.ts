import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
//import { File } from '@ionic-native/file/ngx';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import {
  AngularFireStorage,
  AngularFireUploadTask
} from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Observable, from } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { ModalController, Events } from '@ionic/angular';
//import * as firebase from 'firebase';
import { MessageIntentionComponent } from "../message-intention/message-intention.component";
import { NavParams } from '@ionic/angular';
import {MyImage} from '../../interfaces/image-message'
import { UploadService } from '../../services/upload.service';
@Component({
  selector: 'app-upload-picture',
  templateUrl: './upload-picture.component.html',
  styleUrls: ['./upload-picture.component.scss'],
})
export class UploadPictureComponent implements OnInit {
  @Input() chatId: string;
  @Input() typeOfImg: string;
  @Input() userId: string;

  @Output() passEntry: EventEmitter<any> = new EventEmitter();
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
  UploadedFileURL: Observable<string>;

  //File details
  fileName: string;
  fileSize: number;

  //Status check
  isUploading: boolean;
  isUploaded: boolean;
  //Uploaded Image List
  images: Observable<MyImage[]>;
  private imageCollection: AngularFirestoreCollection<MyImage>;

  private isLoading = false;
  private imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    public us: UploadService,
    //private file: File,
    public popoverCtrl: PopoverController,
    private storage: AngularFireStorage,
    private database: AngularFirestore,
    private events: Events,
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    let selection;
    //this.selectImage();
    if(this.navParams.get('typeOfImg') == 'picture'){
      selection = this.camera.PictureSourceType.PHOTOLIBRARY;
    }else{
      selection = this.camera.PictureSourceType.CAMERA;
    }
    this.pickImage(selection);
    //Set collection where our documents/ images info will save
    this.imageCollection = database.collection<MyImage>("images");
    this.images = this.imageCollection.valueChanges();

    this.isUploading = false;
    this.isUploaded = false;

  }

  ngOnInit() {}
  uploadImage(img) {
    // The File object
    const file = img;
    //console.log("event",event);
    //console.log("file",file, img);
    // Validation for Images Only
    /*if (file.type.split("/")[0] !== "image") {
      console.error("unsupported file type :( ");
      return;
    }*/

    this.isUploading = true;
    this.isUploaded = false;
    this.fileName = this.generateUUID();
    //this.fileName = this.generateUUID();;
    //console.log("name ",this.fileName);

    // The storage path
    if(this.chatId!=null){
      this.path = `chatImagesStorage/${new Date().getTime()}_${this.fileName}.jpg`;
      // Totally optional metadata
    const customMetadata = { app: this.chatId };
    }else if(this.userId!=null){
      this.path = `profileImagesStorage/${new Date().getTime()}_${this.fileName}.jpg`;
    }
    //console.log("this.path; ", this.userId, this.path);
    //File reference
    const fileRef = this.storage.ref(this.path);

    // The main task
    //this.task = this.storage.upload(this.path, file, { customMetadata });
    this.task = fileRef.putString(img, 'data_url');

    // Get file progress percentage
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      finalize(() => {
        console.log("finalizando...")
        // Get uploaded file storage path
        this.UploadedFileURL = fileRef.getDownloadURL();

        this.UploadedFileURL.subscribe(
          resp => {
            //console.log("archivo subido, montando objeto imagen ")
            if(this.chatId!=null){
            this.myImage = {
              name: this.fileName,
              filepath: resp,
              size: this.fileSize,
              chatId: this.chatId
            }
          }else if(this.userId!=null){
            this.myImage = {
              name: this.fileName,
              filepath: resp,
              size: this.fileSize,
              userId: this.userId
            }
          }
            this.addImagetoDB(this.myImage);
            this.isUploading = false;
            this.isUploaded = true;
          },
          error => {
            console.error(error);
          }
        );
      }),
      tap(snap => {
        this.fileSize = snap.totalBytes;
      })
    );
  }

  private generateUUID(): string {
    // Implementation
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  addImagetoDB(image: MyImage) {
    //Create an ID for document
    const id = this.database.createId();
    //console.log("new id: ", id)
    //Set document id with value in database
    this.imageCollection
      .doc(id)
      .set(image)
      .then(resp => {
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  public dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.isUploading = this.isUploaded = false;
    this.modalController.dismiss(
      //this.myImage,
      //ESTO AHORA MISMO no hace falta
      //this.msgIntention$
    );
  }
  public cancelModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss();
  }
  public pickImage(sourceType) {
    console.log("sourceImg",this.typeOfImg);
    const options: CameraOptions = {
      quality: 70,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      console.log(base64Image);
      //this.us.uploadImage(base64Image, this.chatId, this.msgIntention$);
      this.uploadImage(base64Image);
      //this.prepareImage(base64Image);
    }, (err) => {
      // Handle error
      console.log(err);
    });
  }

  async selectImage() {
    console.log(this.navParams.get('typeOfImg'));
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        handler: () => {
          this.dismissModal();
        },
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
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

      selfi.msgIntention$ = msgType;
    });

    popover.onDidDismiss()
      .then((data) => {
        this.isUploading = this.isUploaded = false;
        this.dismissModal();
    });
    return await popover.present();
  }
  */
  async sendPhoto(){
    this.isUploading = this.isUploaded = false;
    //this.msgIntention$ = "modelling"
    this.modalController.dismiss(
      this.myImage,
      //ESTO AHORA MISMO no hace falta
      this.msgIntention$
    );
  }
}
