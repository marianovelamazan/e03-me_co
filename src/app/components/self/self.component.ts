import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { MonitorService } from "../../services/monitor.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
//import { stat } from "fs";
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import {Emotion} from '../../interfaces/image-message';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-self',
  templateUrl: './self.component.html',
  styleUrls: ['./self.component.scss'],
})
export class SelfComponent implements OnInit {
  public userProfile$: any;
  public selfEmotionsForm: FormGroup;
  public selfEmotionsAnswer;
  public selfEmotionsId$;
  public chatid$: string;
  //ESTO ESTA AQUÏ PORQUE SE UTILIZA EN EL ARCHIVO HTML PERO NO SE UTILIZA
  public profileImage$;
  //HASTA AQUÍ
  constructor(
    //private afs: AngularFirestore,
    public ms: MonitorService,
    private route: ActivatedRoute,
    public auth: AuthService,
    private profileService: ProfileService,
    private formBuilder: FormBuilder
  ) {
    this.selfEmotionsAnswer = 0;
    this.selfEmotionsForm = this.formBuilder.group({
      selfEmotionsAnswer: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.chatid$ = this.route.snapshot.paramMap.get("id");
    this.selfEmotionsId$ = this.ms.getChatEmotionId(this.chatid$);
    this.profileService
    .getUserProfile()
    .get()
    .then( userProfileSnapshot => {
      this.userProfile$ = userProfileSnapshot.data();
    });
  }
  public sendEmotion(cardid, type, valence, emotion, description, answer, color, icon, value) {
    console.log(cardid);
    this.ms.sendEmotion(this.ms.getEmotionId(), cardid, type, valence, emotion, description, answer, color, icon, value);
  }
  public showUploadPicture(){
    return;
  }
  public logOut(){
    return;
  }
  public emotions$ = [
    //ACHIEVEMENT EMOTIONS: pride, hope, relief, anger, anxiety, shame, hopelessness
      {
        id: 0,
        type: "achievement",
        emotion: "enjoyment",
        valence: "positive",
        description:
          "if you are having fun and you get some kind of pleasure doing this",
        answer: "",
        selected: false,
        color: "lightPink",
        icon: "heart",
        value: 0
      },
      {
        id: 1,
        type: "achievement",
        emotion: "boredom",
        valence: "negative",
        description:
          "you are bored if you are not interested in doing this",
        answer: "",
        selected: false,
        color: "lightPink",
        icon: "heart",
        value: 0
      },
      {
        id: 2,
        type: "achievement",
        emotion: "relief",
        valence: "positive",
        description:
          "if you feel free of having done this",
        answer: "",
        selected: false,
        color: "lightPink",
        icon: "heart",
        value: 0
      },
      {
        id: 3,
        type: "achievement",
        emotion: "anger",
        valence: "negative",
        description:
          "if this brings you pain or trouble",
        answer: "",
        selected: false,
        color: "lightPink",
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
          "if you want to learn or know more",
        answer: "",
        selected: false,
        color: "Moccasin",
        icon: "heart",
        value: 0
      },
      {
        id: 5,
        type: "epistemic",
        emotion: "surprise",
        valence: "positive",
        description:
          "a feeling of wonder or amazement",
        answer: "",
        selected: false,
        color: "Moccasin",
        icon: "heart",
        value: 0
      },
      {
        id: 6,
        type: "epistemic",
        emotion: "confusion",
        valence: "negative",
        description:
          "if you feel your group or the activity is a mess...",
        answer: "",
        selected: false,
        color: "Moccasin",
        icon: "heart",
        value: 0
      },
      //SOCIAL
      {
        id: 7,
        type: "social",
        emotion: "envy",
        valence: "negative",
        description:
          "if you feel you would like to be like another person in the group (in a bad way)",
        answer: "",
        selected: false,
        color: "PaleTurquoise",
        icon: "heart",
        value: 0
      },
      {
        id: 8,
        type: "social",
        emotion: "admiration",
        valence: "positive",
        description:
          "if you kind of feel a deep respect for someone in your group",
        answer: "",
        selected: false,
        color: "PaleTurquoise",
        icon: "heart",
        value: 0
      },
      {
        id: 9,
        type: "social",
        emotion: "pity",
        valence: "negative",
        description:
          "if you feel sorrow or bad for someone else struggling, suffering or bad luck",
        answer: "",
        selected: false,
        color: "PaleTurquoise",
        icon: "heart",
        value: 0
      },
      {
        id: 10,
        type: "social",
        emotion: "simpathy",
        valence: "positive",
        description:
          "if you feel concerned for other people's feelings in the group",
        answer: "",
        selected: false,
        color: "PaleTurquoise",
        icon: "heart",
        value: 0
      },
    ]
}
