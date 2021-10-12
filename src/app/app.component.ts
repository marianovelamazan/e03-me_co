import { Component } from '@angular/core';

import {ModalController, Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AngularFirestore } from '@angular/fire/firestore';
//import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { ReflectService } from './services/reflect.service';
import { ProfileService } from './services/profile.service';
import { UploadService } from './services/upload.service';
import * as firebase from 'firebase/app';


import { FcmService } from './services/fcm.service';
import {Deeplinks} from "@ionic-native/deeplinks/ngx";
import {HomePage} from "./home/home.page";
import {TeamService} from "./services/team.service";
import {CreateTeamComponent} from "./components/create-team/create-team.component";
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';

//import { ToastService } from './shared/service/toast.service';


const config = {
  apiKey: 'AIzaSyAnshMUfC2UDexYm4auLfrl8rzNlBegy-A',
  authDomain: 'co-talk.firebaseapp.com',
  databaseURL: 'https://co-talk.firebaseio.com',
  projectId: 'co-talk',
  storageBucket: 'co-talk.appspot.com',
  messagingSenderId: '840115476461',
  appId: "1:840115476461:web:6a252cbde9eb218159b9e4",
  measurementId: "G-3Z2NT0FMN2"
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
    //items: Observable<any[]>;
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        //db: AngularFirestore,
        public auth: AuthService,
        public team: TeamService,
        public cs: ChatService,
        public rs: ReflectService,
        public modalController: ModalController,
        public ps: ProfileService,
        public us: UploadService,
        private fcm: FcmService,
        private deeplinks: Deeplinks,
        private firebaseDynamicLinks: FirebaseDynamicLinks
        //public toastController: ToastController
    ) {

        this.initializeApp();
        // this.team.acceptTeamInvitation('vEcE3POCgs8w65WDXscd');
        //this.items = db.collection('items').valueChanges();
    }

    /* private async presentToast(message) {
       const toast = await this.toastController.create({
         message,
         duration: 3000
       });
       toast.present();
     }*/

    private notificationSetup() {
        this.fcm.onNotifications().subscribe(
            (msg) => {
                console.log(msg.messageType);
                if (this.platform.is('ios')) {
                    //this.presentToast(msg.aps.alert);
                } else {
                    //this.presentToast(msg.body);
                    if (msg.wasTapped) {
                        //console.log(msg.body);
                        //this.presentToast(msg.body);
                    }
                    return;
                }
            });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            firebase.initializeApp(config);
            this.notificationSetup();
            this.deeplinkSetup();
            this.firebaseDynamicLinks.onDynamicLink()
                .subscribe((res: any) => console.log(res, 'dynamic'), (error:any) => console.log(error, 'dynamic'));
        });
    }

    deeplinkSetup() {
        this.deeplinks.route({
            '/accept-invite': HomePage,
        }).subscribe(match => {
            if(match && match.$args && match.$args.teamId) {
                const teamID = match.$args.teamId;
                this.team.acceptTeamInvitation(teamID);
            }
            console.log('Successfully matched route', match);
        }, nomatch => {
            // nomatch.$link - the full link data
            console.error('Got a deeplink that didn\'t match', nomatch);
        });
    }
    async createTeam() {
        const createTeamModal = await this.modalController.create({
            component: CreateTeamComponent,
            cssClass: 'createTeamModal'
        });
        await createTeamModal.present();
    }
}
