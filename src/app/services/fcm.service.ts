import { Injectable } from "@angular/core";
//import { Firebase } from "@ionic-native/firebase/ngx";
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from "@ionic/angular";
import { AngularFirestore } from "@angular/fire/firestore";
import 'firebase/auth';
import 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: "root"
})
export class FcmService {
  //public userProfile: firebase.firestore.DocumentReference;
  //public currentUser: firebase.User;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private firebase: FirebaseX,
    private platform: Platform
  ) {
    //ESTA LÍNEA DE ABAJO EMPEZABA CON: firebase.auth()
    /*this.afAuth.auth.onAuthStateChanged(user => {
      console.log("user ",user);
      if (user) {
        this.currentUser = user;
        this.userProfile = this.afs.firestore.doc(`/users/${user.uid}`);
      }
    });*/
  }

  async getToken(user) {
    let token;
    if (this.platform.is("android")) {

      token = await this.firebase.getToken();
      //console.log("token: ", token);
    }
    if (this.platform.is("ios")) {
      token = await this.firebase.getToken();
      await this.firebase.grantPermission();
    }
    this.saveToken(token, user);
  }

  private saveToken(token, user) {
    if (!token) return;
    //console.log("this.userProfile: ", this.userProfile);
    const devicesRef = this.afs.collection("devices");

    const data = {
      token,
      //userId: this.userProfile
      userId: user.uid
    };

    return devicesRef.doc(token).set(data);
  }

  onNotifications() {
    return this.firebase.onMessageReceived();
  }
}
