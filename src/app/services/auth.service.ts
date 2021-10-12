import { Injectable } from '@angular/core';

import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore,
  AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap, first, map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import {FcmService} from "./fcm.service";

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName: string;
  favoriteColor?: string;
  birthDate?: Date;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fcm: FcmService,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
            this.registerUserForPush(user);
          return this.afs.doc<any>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
   }
   registerUserForPush(user) {
       this.fcm.getToken(user);
   }
   getUser() {
    return this.user$.pipe(first()).toPromise();
  }

  googleSignIn() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }
  //email & password
  loginUser(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }
  //email & password
  signupUser(email: string, password: string, name: string, photoURL: string): Promise<any> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then((newUserCredential: firebase.auth.UserCredential) => {
        /*newUserCredential.user.updateProfile({
          displayName: name,
          photoURL: ''
        }) ;*/
        //return this.updateUserData(newUserCredential.user);
        return this.updateUserData({
          uid: newUserCredential.user.uid,
          email: email,
          displayName: name,
          photoURL: photoURL
        });
        /*firebase
          .firestore()
          .doc(`/users/${newUserCredential.user.uid}`)
          .set({ correo: email,
          uid: newUserCredential.user.uid,
          photoURL: "unicorn",
          displayName: "" ,
          favoriteColor: ""
         });*/
      })
      .catch(error => {
        console.error(error);
        throw new Error(error);
      });
  }
  //email && password
  resetPassword(email:string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  private async oAuthLogin(provider) {
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  private updateUserData({ uid, email, displayName, photoURL }) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${uid}`);

    const data = {
      uid,
      email,
      displayName,
      photoURL
    };

    return userRef.set(data, { merge: true });
  }
  private updateUserName({ uid, email, displayName, photoURL }) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${uid}`);

    const data = {
      uid,
      email,
      displayName,
      photoURL
    };

    return userRef.set(data, { merge: true });
  }
  async signOut() {
    await this.afAuth.auth.signOut();
    return this.router.navigate(['/']);
  }
}
