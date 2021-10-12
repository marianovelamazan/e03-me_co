import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ChatService } from "../services/chat.service";
import { ReflectService } from "../services/reflect.service";
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";
import {LoadingController, AlertController, ModalController} from "@ionic/angular";
import { Router } from "@angular/router";
import {CreateTeamComponent} from "../components/create-team/create-team.component";
import {TeamService} from "../services/team.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  userChats$;
  chats$;
  userTeams;
    userTeams$;
    activeTeam = '';
    activeTeamName = '';
    teamSelector: FormControl = new FormControl('');
  //chatReflections$: any;
    customAlertOptions: any = {
        //header: 'Teams'
    };
  public loginForm: FormGroup;
  public loading: HTMLIonLoadingElement;
  constructor(
    public auth: AuthService,
    public cs: ChatService,
    public rs: ReflectService,
    public loadingCtrl: LoadingController,
    public modalController: ModalController,
    public alertCtrl: AlertController,
    private router: Router,
    private teamService: TeamService,
    private formBuilder: FormBuilder,

  ) {
    this.loginForm = this.formBuilder.group({
      email: ['',
        Validators.compose([Validators.required, Validators.email])],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
      this.teamService.activeTeamObserver.subscribe((team: any) => {

      });
  }

  async loginUser(loginForm: FormGroup): Promise<void> {
    if (!loginForm.valid) {
      console.log('Form is not valid yet, current value:', loginForm.value);
    } else {
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();

      const email = loginForm.value.email;
      const password = loginForm.value.password;

      this.auth.loginUser(email, password).then(
        () => {
          this.loading.dismiss().then(() => {
              // Check for any invitation pending for acceptance after login.
              this.teamService.checkForInvitePending();
              this.setTeam();
              this.router.navigate(['/']);
          });
        },
        error => {
          this.loading.dismiss().then(async () => {
            const alert = await this.alertCtrl.create({
              message: error.message,
              buttons: [{ text: 'Ok', role: 'cancel' }],
            });
            await alert.present();
          });
        }
      );
    }
  }

  async ngOnInit() {
    //this.userChats$ = this.cs.getUserChats();
    this.chats$ = this.cs.getChats();
    this.userTeams$ = this.teamService.getTeams();
    this.teamService.activeTeamObserver.subscribe((team: any) => {
        if(team) {
            this.activeTeam = team;
            this.teamChangedFromService(team);
        }
    })
      this.setTeam();
    //this.chatReflections$ = this.rs.getReflections();
  }
  setTeam() {
      this.teamService.getTeams().subscribe((res: any) => {
          this.userTeams = res;
          this.userTeams.map((team: any) => {
              if(team.id == this.activeTeam) {
                  this.activeTeamName = team.teamName;
              }
          });
          if(!this.activeTeam) {
              this.activeTeamName = this.userTeams[0].teamName;
              console.log(this.userTeams[0].id, 'this.userTeams[0].id');
              this.teamService.setActiveTeam(this.userTeams[0].id)
          }
      });
  }

    teamChanged(e) {
      console.log(e);
      if(e.detail.value) {
          if(e.detail.value == 'createTeam') {
              this.createTeam();
          } else {
              this.teamService.setActiveTeam(e.detail.value);
              this.userTeams.map((team: any) => {
                  if(team.id == e.detail.value) {
                      this.activeTeamName = team.teamName;
                  }
              })
          }
      }
    }
    async createTeam() {
        const createTeamModal = await this.modalController.create({
            component: CreateTeamComponent,
            cssClass: 'createTeamModal'
        });
        await createTeamModal.present();
    }
    teamChangedFromService(value) {
      if(value && this.userTeams) {
          this.userTeams.map((team: any) => {
              console.log(team);
              if(team.id == value) {
                  this.activeTeamName = team.teamName;
              }
          })
      }
    }
}
