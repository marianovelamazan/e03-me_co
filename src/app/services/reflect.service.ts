import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { map, switchMap } from "rxjs/operators";
import { firestore } from "firebase";
import { Reflection } from "../interfaces/image-message";
//import { Observable, of } from "rxjs";
//import * as firebase from "firebase/app";
@Injectable({
  providedIn: "root"
})
export class ReflectService {
  private chatReflectionId;
  
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {}
  get(reflectId) {
    return this.afs
      .collection<any>("reflections")
      .doc(reflectId)
      .snapshotChanges()
      .pipe(
        map(doc => {
          const data: Object = doc.payload.data();
            const id = doc.payload.id;
            return { id: id, ...data };
        })
      );
  }
  getChatReflectionId(chatid) {
    const self = this;
    return this.afs
      .collection("reflections", ref => ref.where("chatid", "==", chatid))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: Object = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id: id, ...data };
            //return {actions[0].id};
          });
        })
      )
      .subscribe(actions => {
        self.chatReflectionId = actions[0].id;
        console.log("self.chatReflectionId", actions[0].id);
        return self.chatReflectionId;
      });
  }
  getReflectionId() {
    return this.chatReflectionId;
  }
  //Reflections from user
  getReflections() {
    return this.auth.user$.pipe(
      switchMap(user => {
        return this.afs
          .collection("reflections", ref => ref.where("uid", "==", user.uid))
          .snapshotChanges()
          .pipe(
            map(actions => {
              return actions.map(a => {
                const data: Object = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data };
              });
            })
          );
      })
    );
  }
  /*async create() {
    const { uid } = await this.auth.getUser();

    const data = {
      uid,
      createdAt: Date.now(),
      count: 0,
      opinions: []
      chatId,

    };

    const docRef = await this.afs.collection('reflections').add(data);

    return this.router.navigate(['reflections', docRef.id]);
  }*/

  async sendReflection(reflectionId, cardid, content, type, val) {
    const { uid } = await this.auth.getUser();

    const data = {
      uid,
      cardid,
      content,
      type,
      createdAt: Date.now(),
      value: val
    };

    if (uid) {
      const ref = this.afs.collection("reflections").doc(reflectionId);
      return ref.update({
        opinions: firestore.FieldValue.arrayUnion(data)
      });
    }
  }
  /*
  async deleteMessage(reflection, opinion) {
    const { uid } = await this.auth.getUser();

    const ref = this.afs.collection('reflections').doc(reflection.id);
    console.log(opinion);
    if (reflection.uid === uid || opinion.uid === uid) {
      // Allowed to delete
      delete opinion.user;
      return ref.update({
        opinions: firestore.FieldValue.arrayRemove(opinion)
      });
    }
  }*/
  getOpinionStatistics(chatid) {

    return this.afs
      .collection("reflections", ref => ref.where("chatid", "==", chatid))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: Reflection = a.payload.doc.data() as Reflection;
            return { id: a.payload.doc.id, ...data };
            //
          });
        })
      );
  }
  /*
  joinReflections(chat$: Observable<any>) {
    let reflection;
    const joinKeys = {};

    return chat$.pipe(
      switchMap(r => {
        // Unique chat IDs
        reflection = r;
        const reflectionsids = Array.from(new Set(r.map(v => v.chatid)));

        // Firestore User Doc Reads
        const userDocs = reflectionsids.map(u =>
          this.afs.doc(`chats/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        arr.forEach(v => (joinKeys[(<any>v).chatid] = v));
        reflection.opinions = reflection.opinions.map(v => {
          return { ...v, user: joinKeys[v.chatid] };
        });

        return reflection;
      })
    );
  }
  */
/*
  async incrementarPuntos(
    memberToIncrementPoint,
    typeOfCard,
    cardId,
    reflectionId
  ) {
    let self = this;
    //let type = typeOfCard + "points";

    //this.presentToast("Vamos a sumar los puntos...");

    const { uid } = await this.auth.getUser();

    if (uid) {
      const ref = this.afs.collection("reflections").doc(reflectionId);
      ref.update({
        "opinions.value": firestore.FieldValue.increment(5)
      });
    }
  }*/
}
