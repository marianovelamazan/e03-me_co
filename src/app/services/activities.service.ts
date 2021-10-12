import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {combineAll, map, switchMap} from "rxjs/operators";
import {firestore} from "firebase";

@Injectable({
    providedIn: 'root'
})
export class ActivitiesService {

    constructor(
        private afs: AngularFirestore,
        private auth: AuthService,
        private router: Router
    ) {
    }

    get(activityId) {
        return this.afs
            .collection<any>("activities")
            .doc(activityId)
            .snapshotChanges()
            .pipe(
                map((doc) => {
                    const data: Object = doc.payload.data();
                    const id = doc.payload.id;
                    return { id, ...data };
                })
            );
    }
    getActivities(teamId) {
        return this.auth.user$.pipe(
            switchMap((user) => {
                return this.afs
                    .collection("activities")
                    .snapshotChanges()
                    .pipe(
                        map((activity: any[]) => {
                            const res = activity.map((a: any) => {
                                const data: Object = a.payload.doc.data();
                                const id = a.payload.doc.id;
                                const workings = this.afs.collection("workings", ref => ref.where("activityId", "==", id).where("teamId", '==', teamId)).snapshotChanges()
                                    .pipe(
                                        map((working) => {
                                            const workings =  working.map((a) => {
                                                    const data: Object = a.payload.doc.data();
                                                    const id = a.payload.doc.id;
                                                    return {id,  ...data };
                                                });
                                            return workings[0];
                                        })
                                    );
                                return {id,...data, working: workings };
                            });
                            return res;
                        })
                    );
            })
        );
    }
    getWorkingData(id, teamId) {
        return new Promise(resolve => {
            this.getWorkingStatus(id, teamId).subscribe((res: any) => {
                console.log(res, 'resresres');
                if(res && res.length > 0) {
                  resolve(res[0]);
                } else {
                    resolve(false);
                }
            },error => {
                resolve(false);
            })
        })
    }
    getWorkingStatus(activityId, teamID) {
      return  this.afs.collection("workings", ref => ref.where("activityId", "==", activityId).where("teamId", '==', teamID))
            .snapshotChanges()
            .pipe(
                map((actions) => {
                    return actions.map((a) => {
                        const data: Object = a.payload.doc.data();
                        const id = a.payload.doc.id;
                        return {id,  ...data };
                    });
                })
            );
    }
    async updateWorkings(teamId, chatId, activityId) {
        const { uid } = await this.auth.getUser();
        let type = "text";
        const data = {
            uid,
            teamId: teamId,
            chatId: chatId,
            createdAt: Date.now(),
            activityId: activityId,
            status: 1,
            _id: this.afs.createId()
        };
        console.log(uid);

        if (uid) {
            const ref = this.afs.collection("workings").add(data);
        }
    }
    updateWorkingStatus(teamId, activityId, status) {
        return new Promise((resolve) => {
            try {
                console.log('asdads', status);
                this.afs.collection("workings", ref => ref.where("activityId", "==", activityId).where("teamId", '==', teamId))
                    .get().subscribe((actions) => {
                        console.log(actions);
                            const data = actions.forEach(result => {
                                const id = result.id;
                                return this.afs.collection("workings").doc(id).update({status: status});
                            });
                        }, error => {

                });
            } catch (e) {
                resolve(false)
            }

        })

    }
}
