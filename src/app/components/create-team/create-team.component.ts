import {Component, OnInit} from '@angular/core';
import {TeamService} from "../../services/team.service";
import {AlertController, LoadingController, ModalController} from "@ionic/angular";

@Component({
    selector: 'app-create-team',
    templateUrl: './create-team.component.html',
    styleUrls: ['./create-team.component.scss'],
})
export class CreateTeamComponent implements OnInit {
    nameOfTeam: any = '';
    invitee: any = '';
    invitee2: any = '';
    invitee3: any = '';
    explanatoryText: any = '';
    currentPage: any = 0;
    loading: any;

    constructor(private teamService: TeamService, private alertCtrl: AlertController, private modal: ModalController, private loadingCtrl: LoadingController) {
    }

    ngOnInit() {
    }

    async pageChanged(e) {
        this.currentPage = await e.getActiveIndex();
    }

    async createTeam() {
        this.loading = await this.loadingCtrl.create();
        await this.loading.present();
        let dataOfTeam = {
            teamName: this.nameOfTeam,
            members: [],
            explanatoryText: this.explanatoryText
        };
        if (this.invitee) {
            dataOfTeam.members.push({mail: this.invitee, uId: ''});
        }
        if (this.invitee2) {
            dataOfTeam.members.push({mail: this.invitee2, uId: ''});
        }
        if (this.invitee3) {
            dataOfTeam.members.push({mail: this.invitee3, uId: ''});
        }
        console.log('asdas', dataOfTeam);
        await this.teamService.create(dataOfTeam);
        this.loading.dismiss().then(async () => {
            this.modal.dismiss();
            const alert = await this.alertCtrl.create({
                header: 'team',
                message: this.nameOfTeam + ' created!',
                buttons: [{ text: 'great!', role: 'cancel' }],
            });
            await alert.present();
        });

    }
    closeButton() {
        this.modal.dismiss();
    }
}
