import { Component,  OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
//import { Observable } from "rxjs";
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadPictureComponent } from 'src/app/components/upload-picture/upload-picture.component';
//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { AngularFirestore } from '@angular/fire/firestore';
//import { EmotionService } from 'src/app/services/emotion.service';
//import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public userProfile$: any;
  public birthDate: Date;
  
  public profileImage$: any;
  public infoPoints$: Promise<void>;
  public proposalPoints$: number;
  public checkingPoints$: number;
  public modellingPoints$: number;
  public presentingPoints$: number;  
  
  //emotions
  /*public emotionsForm: FormGroup;
  public emotionsAnswer;
  emotionId$;

  chatid$: string;*/

  constructor(
    
    private alertCtrl: AlertController,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    public modalController: ModalController,
    private ps: ProfileService,
    //private afs: AngularFirestore,
    //public es: EmotionService,
    //private route: ActivatedRoute,
    public auth: AuthService,
    //private formBuilder: FormBuilder
  ) {
    /*this.emotionsAnswer = 0;
    this.emotionsForm = this.formBuilder.group({
      emotionsAnswer: ["", Validators.required]
    });*/
  }

  ngOnInit() {
    //this.chatid$ = this.route.snapshot.paramMap.get("id");
    //this.emotionId$ = this.es.getChatEmotionId(this.chatid$); 
    
    this.profileService
    .getUserProfile()
    .get()
    .then( userProfileSnapshot => {
      this.userProfile$ = userProfileSnapshot.data();
      this.birthDate = userProfileSnapshot.data().birthDate;
      this.profileImage$ = userProfileSnapshot.data().photoURL;
      this.infoPoints$ = userProfileSnapshot.data().info_points;
      this.proposalPoints$ = userProfileSnapshot.data().proposal_points;
      this.checkingPoints$ = userProfileSnapshot.data().checking_points;
      this.modellingPoints$ = userProfileSnapshot.data().modelling_points;
      this.presentingPoints$ = userProfileSnapshot.data().presenting_points;
    });
    this.ps.getInfoPoints();
  }

  logOut(): void {
    this.authService.signOut().then( () => {
      this.router.navigateByUrl('home');
    });
  }
  showPoints(){
    
  }
  async updateName(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your first name & last name',
      inputs: [
        {
          type: 'text',
          name: 'firstName',
          placeholder: 'Your first name',
          value: this.userProfile$.firstName,
        },
        {
          type: 'text',
          name: 'lastName',
          placeholder: 'Your last name',
          value: this.userProfile$.lastName,
        },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.profileService.updateName(data.firstName, data.lastName);
          },
        },
      ],
    });
    await alert.present();
  }
  //DOB = Date Of Birth
  updateDOB(birthDate: Date): void {
    if (birthDate === undefined) {
      return;
    }
    this.profileService.updateDOB(birthDate);
  }
  async updateEmail(): Promise<void> {
    const alert = await this.alertCtrl.create({
      inputs: [
        { type: 'text', name: 'newEmail', placeholder: 'Your new email' },
        { name: 'password', placeholder: 'Your password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.profileService
              .updateEmail(data.newEmail, data.password)
              .then(() => {
                console.log('Email Changed Successfully');
              })
              .catch(error => {
                console.log('ERROR: ' + error.message);
              });
          },
        },
      ],
    });
    await alert.present();
  }
  
  async updatePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
      inputs: [
        { name: 'newPassword', placeholder: 'New password', type: 'password' },
        { name: 'oldPassword', placeholder: 'Old password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.profileService.updatePassword(
              data.newPassword,
              data.oldPassword
            );
          },
        },
      ],
    });
    await alert.present();
  }
  async submitProfileImage() {
    this.profileService.updatePhotoURL(this.profileImage$.filepath);
    //console.log("data from modal", this.profileImage$.filepath);
    //this.profileImage$ = "";
  }
  async showUploadPicture() {
    const modal = await this.modalController.create({
      component: UploadPictureComponent,
      componentProps: {
        'userId': this.profileService.getUserProfile(),
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.profileImage$ = data['data']; 
        this.submitProfileImage();
    });
    return await modal.present();
  }
  /*
  public sendEmotion(cardid, type, valence, emotion, description, answer, color, icon, value) {
    //console.log(cardid);
    this.es.sendEmotion(this.es.getEmotionId(), cardid, description, answer, color, valence, icon, emotion, type, value);
  }*/
  /*
  public emotions$ = [
    //ACHIEVEMENT EMOTIONS: pride, hope, relief, anger, anxiety, shame, hopelessness
      {
        id: 0,
        type: "achievement",
        emotion: "enjoyment",
        valence: "positive",
        description:
          "definition of enjoyment",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 1,
        type: "achievement",
        emotion: "boredom",
        valence: "negative",
        description:
          "definition of boredom",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 2,
        type: "achievement",
        emotion: "relief",
        valence: "positive",
        description:
          "definition of relief",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 3,
        type: "achievement",
        emotion: "anger",
        valence: "negative",
        description:
          "definition of anger",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      //EPISTEMIC
      {
        id: 4,
        type: "epistemic",
        emotion: "curiosity",
        valence: "positive",
        description:
          "definition of curiosity",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 5,
        type: "epistemic",
        emotion: "surprise",
        valence: "positive",
        description:
          "definition of surprise",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 5,
        type: "epistemic",
        emotion: "confusion",
        valence: "negative",
        description:
          "definition of confusion",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      //SOCIAL
      {
        id: 6,
        type: "social",
        emotion: "envy",
        valence: "negative",
        description:
          "definition of envy",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 7,
        type: "social",
        emotion: "admiration",
        valence: "positive",
        description:
          "definition of admiration",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 8,
        type: "social",
        emotion: "pity",
        valence: "negative",
        description:
          "definition of pity",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
      {
        id: 9,
        type: "social",
        emotion: "simpathy",
        valence: "positive",
        description:
          "definition of simpathy",
        answer: "",
        selected: false,
        color: "magenta",
        icon: "heart",
        value: 0
      },
    ]*/
}
