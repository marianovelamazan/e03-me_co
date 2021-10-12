import {Injectable} from "@angular/core";

import {
    AngularFirestore,
    AngularFirestoreDocument,
} from "@angular/fire/firestore";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {firestore, database} from "firebase/app";
import {map, switchMap, take, tap} from "rxjs/operators";
import {Observable, combineLatest, of} from "rxjs";
import {MyUser} from '../interfaces/image-message';
import {TeamService} from "./team.service";
import {ActivitiesService} from "./activities.service";

@Injectable({
    providedIn: "root",
})
export class ChatService {
    uids: any;
    userDocs;
    userData: Observable<any>;
    userDataRef: AngularFirestoreDocument<any>;
    user: any;
    users: any = [];
    usersNew: any = [];
    column_width$: number;

    constructor(
        private afs: AngularFirestore,
        private auth: AuthService,
        private activityService: ActivitiesService,
        private teamService: TeamService,
        private router: Router
    ) {

    }

    get(chatId) {
        return this.afs
            .collection<any>("chats")
            .doc(chatId)
            .snapshotChanges()
            .pipe(
                map((doc) => {
                    const data: Object = doc.payload.data();
                    const id = doc.payload.id;
                    return {id, ...data};
                })
            );
    }

    getChats() {
        return this.auth.user$.pipe(
            switchMap((user) => {
                return this.afs
                    .collection("chats")
                    .snapshotChanges()
                    .pipe(
                        map((actions) => {
                            return actions.map((a) => {
                                const data: Object = a.payload.doc.data();
                                const id = a.payload.doc.id;
                                return {id, ...data};
                            });
                        })
                    );
            })
        );
    }

    getUserChats() {
        return this.auth.user$.pipe(
            switchMap((user) => {
                return this.afs
                    .collection("chats", (ref) => ref.where("uid", "==", user.uid))
                    .snapshotChanges()
                    .pipe(
                        map((actions) => {
                            return actions.map((a) => {
                                const data: Object = a.payload.doc.data();
                                const id = a.payload.doc.id;
                                return {id, ...data};
                            });
                        })
                    );
            })
        );
    }

    async create() {
        const {uid} = await this.auth.getUser();

        const data = {
            uid,
            createdAt: Date.now(),
            count: 0,
            messages: [],
        };

        const docRef = await this.afs.collection("chats").add(data);

        const reflectionData = {
            uid,
            createdAt: Date.now(),
            count: 0,
            opinions: [],
            chatid: docRef.id,
        };

        const reflectionDocRef = await this.afs
            .collection("reflections")
            .add(reflectionData);
            const emotionData ={
                uid,
                count:0,
                createdAt: Date.now(),
                emotions: [],
                chatid: docRef.id,
              }
              const emotionDocRef = await this.afs
                  .collection("emotions")
                  .add(reflectionData);
                return docRef.id;

        return this.router.navigate(["chats", docRef.id]);
    }

    async createChatForTeam(teamId, activity) {
        const {uid} = await this.auth.getUser();

        const data = {
            uid,
            createdAt: Date.now(),
            count: 0,
            messages: [],
            teamId: teamId,
            activityId: activity.id
        };

        const docRef = await this.afs.collection("chats").add(data);

        const reflectionData = {
            uid,
            createdAt: Date.now(),
            count: 0,
            opinions: [],
            chatid: docRef.id,
        };

        const reflectionDocRef = await this.afs
            .collection("reflections")
            .add(reflectionData);
const emotionData ={
    uid,
    count:0,
    createdAt: Date.now(),
    emotions: [],
    chatid: docRef.id,
  }
  const emotionDocRef = await this.afs
      .collection("emotions")
      .add(reflectionData);
    return docRef.id;
        return docRef.id;
    }

    async sendMessage(chatId, content, msgIntention) {
        const {uid} = await this.auth.getUser();
        let type = "text";
        const data = {
            uid,
            content,
            type,
            msgIntention,
            createdAt: Date.now(),
            acceptedAsAnswerBy: [],
            mId: this.afs.createId()
        };

        if (uid) {
            const ref = this.afs.collection("chats").doc(chatId);
            console.log("sending msg: ", data);
            return ref.update({
                messages: firestore.FieldValue.arrayUnion(data),
            });
        }
    }
    getColumnWidth() {
        //console.log("column width");
        let width = 3;
        if (this.uids.length > 4) {
            width = 12 / this.uids.length;
        }
        return width;
    }
    async getNumberOfUsers(){
        console.log("this.uids.length ",this.uids.length);
        return this.uids.length;
    }
    async markAsAnswer(chat, message, users) {
        const {uid} = await this.auth.getUser();
        const {id} = chat;
        const incrementAcceptedUser = (msg) => {
            if(message.acceptedAsAnswerBy.length == (users.length - 1)) {
                this.changeActivityState(chat, 2);
            }
            msg.acceptedAsAnswerBy.push(uid);
        }
        const decrementAcceptedUser = (msg, presence) => {
            if(message.acceptedAsAnswerBy.length == (users.length)) {
                this.changeActivityState(chat, 1);
            }
            msg.acceptedAsAnswerBy.splice(presence, 1)
        }
        const newChatData = chat.messages.map((msg: any) => {
            if (message.mId == msg.mId) {
                const presence = msg.acceptedAsAnswerBy.indexOf(uid);
                console.log(presence);
                presence <= -1 ? incrementAcceptedUser(msg) : decrementAcceptedUser(msg, presence);
            }
            delete msg.user;
            return msg;
        });
        if (uid) {
            delete chat.id;
            const ref = this.afs.collection("chats").doc(id).update({messages: newChatData});
            // this.activityService.markAsFinishWorking(chat);
            return ref
        }
    }
    async changeActivityState(chat, status) {
        console.log('change activity status', status);
        this.activityService.updateWorkingStatus(chat.teamId, chat.activityId, status).then(() => {});
    }
    async sendImageMessage(chatId, content, type, msgIntention) {
        const {uid} = await this.auth.getUser();

        const data = {
            uid,
            content,
            type,
            msgIntention,
            createdAt: Date.now(),
            acceptedAsAnswerBy: [],
            mId: this.afs.createId()
        };

        if (uid) {
            const ref = this.afs.collection("chats").doc(chatId);
            console.log("sending image msg: ", data);
            return ref.update({
                messages: firestore.FieldValue.arrayUnion(data),
            });
        }
    }

    async deleteMessage(chat, msg) {
        const {uid} = await this.auth.getUser();

        const ref = this.afs.collection("chats").doc(chat.id);
        //console.log(msg);
        if (chat.uid === uid || msg.uid === uid) {
            // Allowed to delete
            delete msg.user;
            return ref.update({
                messages: firestore.FieldValue.arrayRemove(msg),
            });
        }
    }

    joinUsers(chat$: Observable<any>) {
        let chat;
        const joinKeys = {};

        return chat$.pipe(
            switchMap(async (c) => {
                // Unique User IDs
                chat = c;
                if (c.teamId) {
                    this.uids = await this.teamService.getTeamMembers(c.teamId);
                } else {
                    this.uids = Array.from(new Set(c.messages.map((v) => v.uid)));
                }
                this.users.length = 0;
                if (this.users.length <= 0) {
                    this.getUser(this.uids[0]);
                }
                let iter = 0;
                let that = this;

                if (this.users.length <= 0) {
                    for (let u of this.uids) {
                        if (this.users.length > 0) {
                            for (let value of this.users) {
                                if (value.uid === u) {
                                    //    console.log("existe");
                                    this.users.splice(iter, 1);
                                } else {
                                    console.log("getting user");
                                    await this.getUser(u);
                                }
                                iter++;
                            }
                        } else {
                            await this.getUser(u);
                        }
                        // console.log("this.users ", this.users, u);
                    }
                }

                this.userDocs = this.uids.map((u) =>
                    this.afs.doc(`users/${u}`).valueChanges()
                );
                //console.log("this.userDocs.subscribe(data=>console.log(data)); ",this.userDocs.subscribe(data=>console.log(data)));
                const users = this.users;
                users.shift();
                this.usersNew = [...this.users];
                return this.userDocs.length ? combineLatest(this.userDocs) : of([]);
            }),
            map((arr) => {
                arr.forEach((v) => (joinKeys[(<any>v).uid] = v));
                chat.messages = chat.messages.map((v) => {
                    return {...v, user: joinKeys[v.uid]};
                });

                return chat;
            })
        );
    }

    getUser(uid) {
        return new Promise((resolve) => {

            this.afs.collection('users').doc(uid).valueChanges().subscribe(data => {

                this.users.push(data);
                resolve(data);
            });
        })
    }

}
