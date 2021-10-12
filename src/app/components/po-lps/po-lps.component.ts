import {Component, Input, OnInit} from '@angular/core';
import {ActivitiesService} from "../../services/activities.service";
import {Observable} from "rxjs";
import {TeamService} from "../../services/team.service";
import {ChatService} from "../../services/chat.service";
import {Router} from "@angular/router";
import {NavController} from "@ionic/angular";

@Component({
  selector: 'app-po-lps',
  templateUrl: './po-lps.component.html',
  styleUrls: ['./po-lps.component.scss'],
})
export class PoLPsComponent implements OnInit {
    activityList: any;
    @Input() teamName: string;
    constructor(public activityService: ActivitiesService,
              private teamService: TeamService,
              private router: NavController,
              private chatService: ChatService) { }

  async ngOnInit() {
      this.teamService.activeTeamObserver.subscribe((team: any) => {
          this.activityService.getActivities(team).subscribe(async (activities: any) => {

              this.activityList = activities;

          })
      });
    // this.activityList = await this.activityService.getActivities(activeTeam);

  }
    workOn(activity, flag = true) {
        const activeTeam = this.teamService.activeTeamSubject.getValue();
        this.getStatus(activity).then(async (res: any) => {
            console.log(res);
            if(res && res.task) {
                if(res.task == 'createChat') {
                    const chatId = await this.chatService.createChatForTeam(activeTeam, activity);
                    this.activityService.updateWorkings(activeTeam, chatId, activity.id)
                    setTimeout(() => {
                        if(flag) {
                            this.workOn(activity, false);
                        }
                    }, 200);
                } else if(res.task == 'goToChat') {
                    const activeWorkings = res.data[0];
                    this.router.navigateForward('/chats/' + activeWorkings.chatId, {queryParams: {teamName: this.teamName, activity: activity.id}});
                }
            }
        })
    }
    getStatus(activity) {
        return new Promise((resolve) => {
            const activeTeam = this.teamService.activeTeamSubject.getValue();
            this.activityService.getWorkingStatus(activity.id, activeTeam).subscribe(async (workIsInProgress: any) => {
                if(!workIsInProgress || workIsInProgress.length == 0) {
                    resolve({
                        task: 'createChat',
                    })

                } else {

                    resolve({
                        task: 'goToChat',
                        data: workIsInProgress
                    })

                }
            },error => resolve({task: 'ignore'}));
        });


    }
    reflactionOn(activity) {

    }
}
