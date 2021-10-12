import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from "firebase";
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public userProfile: firebase.firestore.DocumentReference;
  public currentUser: firebase.User;
  userProfileById: firebase.firestore.DocumentReference;
  
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private auth: AuthService,
  ) {
    //ESTA LÍNEA DE ABAJO EMPEZABA CON: firebase.auth()
    this.afAuth.auth.onAuthStateChanged(user => {
      //console.log("user ",user);
      if (user) {
        this.currentUser = user;
        this.userProfile = this.afs.firestore.doc(`/users/${user.uid}`);
        
      }
    });
  } 
  getUserProfileById(usr){
   return this.userProfileById = this.afs.firestore.doc(`/users/${usr}`);
  }
  getUserProfile(): firebase.firestore.DocumentReference {
    //console.log("user ", this.userProfile);
    return this.userProfile;
  }
  updateName(firstName: string, lastName: string): Promise<any> {
    return this.userProfile.update({ firstName: firstName, lastName: lastName });
  }
  async updatePhotoURL(purl: string): Promise<any> {
    return this.userProfile.update({ photoURL: purl });
  }
  
  updateDOB(birthDate: Date): Promise<any> {
    return this.userProfile.update({ birthDate });
  }
  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      password
    );
  
    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updateEmail(newEmail).then(() => {
          this.userProfile.update({ email: newEmail });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );
  
    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updatePassword(newPassword).then(() => {
          console.log('Password Changed');
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  async incrementarPuntos(
    type,
  ) {
    const { uid } = await this.auth.getUser();   
    
    if (uid) {
      const ref = this.afs.collection("users").doc(uid);
      ref.update({
        [type+"_points"]: firestore.FieldValue.increment(1)
      });
    }
  }
  async getInfoPoints(){
    const { uid } = await this.auth.getUser();   
    
    if (uid) {
      const docref = this.afs.collection("users").doc(uid);
      docref.ref.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data: ", doc.data().info_points);
            return doc.data().info_points;
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    }
  }
}
