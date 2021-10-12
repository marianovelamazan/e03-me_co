import { Injectable } from '@angular/core';
import { AuthService } from "./auth.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { map, switchMap } from "rxjs/operators";
import { firestore } from "firebase";
import { Emotion } from "../interfaces/image-message";
import {Observable, combineLatest, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  private chatEmotionId;
  negative_emotions;
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {}
  get(emotId) {
    return this.afs
      .collection<any>("emotions")
      .doc(emotId)
      .snapshotChanges()
      .pipe(
        map(doc => {
          const data: Object = doc.payload.data();
            const id = doc.payload.id;
            return { id: id, ...data };
        })
      );
  }
  //get emotionsId from chatid
  getChatEmotionId(chatid) {
    const self = this;
    return this.afs
      .collection("emotions", ref => ref.where("chatid", "==", chatid))
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
        self.chatEmotionId = actions[0].id;
        console.log("self.chatEmotionId", actions[0].id);
        return self.chatEmotionId;
      });
  }
  getEmotionId() {
    return this.chatEmotionId;
  }
  
  //Emotions from current user
  getEmotions() {
    return this.auth.user$.pipe(
      switchMap(user => {
        return this.afs
          .collection("emotions", ref => ref.where("uid", "==", user.uid))
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
  
  //Emotions from selected user
  getUserEmotions(u, c) {
    
      console.log("u, c ", u, c);
      return this.afs.collection<Emotion>(`emotions`, ref => ref
      //.where("uid", "==", u)
      .where("chatid", "==", c)
      ).valueChanges();
      
    //}
  }
  getNegativeEmotions(u, c) {
    
    const emotionsSnapshot = this.afs.collection<Emotion>(`emotions`, ref => ref
    //.where("uid", "==", u)
    .where("chatid", "==", c)
    ).snapshotChanges();
    
    return emotionsSnapshot;
    
    //const emotions = await Promise.all(results);
    //return emotions;
  }

  async sendEmotion(emotionId, cardid, type, valence, emotion, description, answer, color, icon, value) {
    const { uid } = await this.auth.getUser();

    const data = {
      uid,
      cardid,
      type,
      valence,
      emotion,
      description,
      answer, 
      color, 
      icon,
      createdAt: Date.now(),
      value: value
    };

    if (uid) {
      const ref = this.afs.collection("emotions").doc(emotionId);
      return ref.update({
        opinions: firestore.FieldValue.arrayUnion(data)
      });
    }
  }
  /*
  async deleteMessage(emotion, opinion) {
    const { uid } = await this.auth.getUser();

    const ref = this.afs.collection('emotions').doc(emotion.id);
    console.log(opinion);
    if (emotion.uid === uid || opinion.uid === uid) {
      // Allowed to delete
      delete opinion.user;
      return ref.update({
        opinions: firestore.FieldValue.arrayRemove(opinion)
      });
    }
  }*/
  /*getOpinionStatistics(chatid) {

    return this.afs
      .collection("emotions", ref => ref.where("chatid", "==", chatid))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: Emotion = a.payload.doc.data() as Emotion;
            return { id: a.payload.doc.id, ...data };
            //
          });
        })
      );
  }*/
  joinEmotions(chat$: Observable<any>) {
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
}
