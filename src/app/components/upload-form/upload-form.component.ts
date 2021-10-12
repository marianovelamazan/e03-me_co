import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
//import { UploadService } from "../services/upload.service";
//import { NavParams } from "@ionic/angular";
import {
  AngularFireStorage,
  AngularFireUploadTask
} from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { ModalController } from '@ionic/angular';
import { MyData } from '../../interfaces/image-message';

@Component({
  selector: "app-upload-form",
  templateUrl: "./upload-form.component.html",
  styleUrls: ["./upload-form.component.scss"]
})
export class UploadFormComponent implements OnInit {
  @Input() chatId: string;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  private path: string;
  private myImage;
  public fileForm = new FormGroup({
    file: new FormControl(null, Validators.required)
  });
  /*
  public msgFile = 'No hay un archivo seleccionado';
  public formData = new FormData();
  //public fileName = '';
  public URLPublic = '';
  //public percentage = 0;
  public finished = false;
  */
  //*********************************************************NEW */
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
  images: Observable<MyData[]>;
  private imageCollection: AngularFirestoreCollection<MyData>;

  constructor(
    //private us: UploadService,
    private storage: AngularFireStorage,
    private database: AngularFirestore,
    private modalController: ModalController
  ) {
    // componentProps can also be accessed at construction time using NavParams
    //console.log(navParams.get('firstName'));

    //Set collection where our documents/ images info will save
    this.imageCollection = database.collection<MyData>("images");
    this.images = this.imageCollection.valueChanges();

    this.isUploading = false;
    this.isUploaded = false;
  }
  ngOnInit() {}

  uploadImage(event: FileList) {
    // The File object
    const file = event.item(0);

    // Validation for Images Only
    if (file.type.split("/")[0] !== "image") {
      console.error("unsupported file type :( ");
      return;
    }

    this.isUploading = true;
    this.isUploaded = false;

    this.fileName = file.name;

    // The storage path
    this.path = `chatImagesStorage/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: this.chatId };

    //File reference
    const fileRef = this.storage.ref(this.path);

    // The main task
    this.task = this.storage.upload(this.path, file, { customMetadata });

    // Get file progress percentage
    this.percentage = this.task.percentageChanges();
    
    this.snapshot = this.task.snapshotChanges().pipe(
      finalize(() => {
        // Get uploaded file storage path
        this.UploadedFileURL = fileRef.getDownloadURL();

        this.UploadedFileURL.subscribe(
          resp => {
            this.myImage = {
              name: file.name,
              filepath: resp,
              size: this.fileSize,
              chatId: this.chatId
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

  addImagetoDB(image: MyData) {
    //Create an ID for document
    const id = this.database.createId();

    //Set document id with value in database
    this.imageCollection
      .doc(id)
      .set(image)
      .then(resp => {
        console.log(resp);
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  public dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(
      this.myImage
    );
  }
  /***************************************************** */

  //Evento que se gatilla cuando el input de tipo archivo cambia
  /* public changeFile(event) {
    if (event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.msgFile = `File ready: ${event.target.files[i].name}`;
        this.fileName = event.target.files[i].name;
        this.formData.delete('file');
        this.formData.append('file', event.target.files[i], event.target.files[i].name)
      }
    } else {
      this.msgFile = 'No hay un archivo seleccionado';
    }
  }

  //Sube el archivo a Cloud Storage
  public uploadFile() {
    console.log("updating...");
    let file = this.formData.get('file');
    let reference = this.us.referenceCloudStorage(this.fileName);
    let task = this.us.taskCloudStorage("", this.fileName, file);

    //Cambia el porcentaje
    task.percentageChanges().subscribe((percentage) => {
      this.percentage = Math.round(percentage);
      if (this.percentage == 100) {
        this.finished = true;
      }
    });

    reference.getDownloadURL().subscribe((URL) => {
      this.URLPublic = URL;
    });

  }*/
}
