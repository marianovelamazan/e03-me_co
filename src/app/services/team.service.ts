import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {map, switchMap} from "rxjs/operators";
import {firestore} from "firebase";
import {HttpClient} from "@angular/common/http";
import {AlertController} from "@ionic/angular";

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    uids: unknown[];
    userDocs;
    userData: Observable<any>;
    userDataRef: AngularFirestoreDocument<any>;
    user: any;
    users: any = [];
    column_width$: number;

    activeTeamSubject: BehaviorSubject<any> = new BehaviorSubject<unknown>(null);
    activeTeamObserver = this.activeTeamSubject.asObservable();
    activeTeamMembersSubject: BehaviorSubject<any> = new BehaviorSubject<unknown>([]);
    activeTeamMembersObserver = this.activeTeamMembersSubject.asObservable();

    constructor(
        private afs: AngularFirestore,
        private auth: AuthService,
        private alertCtrl: AlertController,
        private http: HttpClient,
        private router: Router
    ) {
        const activeTeam = localStorage.getItem('selectedTeam');
        console.log(activeTeam);
        this.activeTeamSubject.next(activeTeam);
    }

    get(teamId) {
        return this.afs
            .collection<any>("teams")
            .doc(teamId)
            .snapshotChanges()
            .pipe(
                map((doc) => {
                    const data: Object = doc.payload.data();
                    const id = doc.payload.id;
                    return {id, ...data};
                })
            );
    }
    // get user teams where user is member or admin of team.
    getTeams() {
        return this.auth.user$.pipe(
            switchMap((user) => {
                return this.afs
                    .collection("teams")
                    .snapshotChanges()
                    .pipe(
                        map((actions) => {
                            const data = actions.filter((a) => {
                                const data: any = a.payload.doc.data();
                                let isMember = false;
                                for (let member of data.members) {
                                    if (user && member.uId == user.uid) {
                                        isMember = true;
                                    }
                                }
                                isMember = data.uid == user.uid ? true : isMember;
                                return isMember;
                            });
                            return data.map((a) => {
                                const data: any = a.payload.doc.data();
                                const id = a.payload.doc.id;
                                return {id, ...data};
                            })
                        })
                    );
            })
        );
    }
    // get team members users list.
    async getTeamMembers(teamId) {
        return new Promise(resolve => {
            this.get(teamId).subscribe((res: any) => {
                console.log(res);
                let uids = res.members.filter((member: any) => {
                    return member.uId && member.uId.length > 0;
                }).map((member: any) => {
                    return member.uId
                });
                uids.push(res.uid);
                this.activeTeamMembersSubject.next(uids);
                resolve(uids);
            });
        });
    }

    getUserTeams() {
        return this.auth.user$.pipe(
            switchMap((user) => {
                console.log('user team', user);
                return this.afs
                    .collection("teams", (ref) => ref.where("uid", "==", user.uid))
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

    async create(teamData) {
        const user: any = await this.auth.getUser();

        const data = {
            uid: user.uid,
            createdAt: Date.now(),
            teamOwner: user.uid,
            teamName: teamData.teamName,
            members: teamData.members,
        };
        const docRef = await this.afs.collection("teams").add(data);
        this.setActiveTeam(docRef.id);
        this.sendMailToMembers(teamData, docRef.id, user);
        return true;
    }
    // send mail to users using cloud functions defined in firestore.
    sendMailToMembers(teamData, teamId, user) {
        teamData.members.map((member: any) => {
            console.log(teamData.teamName);
            this.http.get(`https://us-central1-co-talk.cloudfunctions.net/sendMail?sentTo=${member.mail}&teamId=${teamId}&explanatoryText=${teamData.explanatoryText}&teamName=${teamData.teamName}&invitedBy=${user.email}`).subscribe((res: any) => {

            });
        });
    }

    async acceptInvite(teamData) {
        const {uid} = await this.auth.getUser();

        const data = {
            uid,
            createdAt: Date.now(),
            teamOwner: uid
        };

        const docRef = await this.afs.collection("teams").doc(teamData.id);
        docRef.update({members: teamData.members});
        const alert = await this.alertCtrl.create({
            message: 'Invitation accepted successfully',
            buttons: [{ text: 'Ok', role: 'cancel' }],
        });
        await alert.present();
        localStorage.removeItem('inviteAcceptId');
        return this.router.navigate(["home"]);

    }

    setActiveTeam(team) {
        localStorage.setItem('selectedTeam', team);
        this.activeTeamSubject.next(team);
    }
    // if non logged in user visit app using invite link then we use team code to accept invitation after login or
    // registration completed.
    async checkForInvitePending() {
        console.log('dasdasd');
        const teamId = localStorage.getItem('inviteAcceptId');
        if (teamId && teamId.length > 0) {
            const user: any = await this.auth.getUser();
            if (user) {
                this.get(teamId).subscribe(async (res: any) => {

                    let flag = true;
                    let teamData = res;
                    for (let member of teamData.members) {
                        if (member.mail == user.email) {
                            flag = false;
                            member.uId = user.uid;
                        }
                    }
                    if(flag) {
                        const alert = await this.alertCtrl.create({
                            message: 'You are logged in with a different account',
                            buttons: [{ text: 'Ok', role: 'cancel' }],
                        });
                        await alert.present();
                    } else {
                        this.acceptInvite(teamData);
                    }

                });
            } else {
                localStorage.setItem('inviteAcceptId', teamId);
            }
        }
    }
    // Accept invitation when user use invite link to accept invite. If user is not logged in store invite data to
    // local storage to use once user is registered or logged.
    async acceptTeamInvitation(teamID) {

        const user: any = await this.auth.getUser();
        console.log(user);
        if (user) {
            this.get(teamID).subscribe(async (res: any) => {

                let teamData = res;
                for (let member of teamData.members) {
                    if (member.mail == user.email) {
                        console.log('asdasd');
                        member.uId = user.uid;
                    }
                }
                await this.acceptInvite(teamData);
                localStorage.removeItem('inviteAcceptId');

            });
        } else {
            const alert = await this.alertCtrl.create({
                message: 'Please login with your account credentials to join the team',
                buttons: [{ text: 'Ok', role: 'cancel' }],
            });
            await alert.present();
            localStorage.setItem('inviteAcceptId', teamID);
        }

    }
}
