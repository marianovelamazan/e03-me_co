import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { LoadingController, AlertController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ModalController } from '@ionic/angular';
//import { UploadFormComponent } from '../upload-form/upload-form.component';
import { UploadPictureComponent } from '../../components/upload-picture/upload-picture.component';
import {TeamService} from "../../services/team.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.scss"]
})
export class SignupPage implements OnInit {
  public signupForm: FormGroup;
  public loading: any;
  public userPhotoURL: any ="";

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private teamService: TeamService,
    private router: Router,
    public modalController: ModalController
  ) {
    this.signupForm = this.formBuilder.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      //image: ["", Validators.compose([Validators.required])],
      name: ["", Validators.compose([Validators.required, Validators.minLength(2)])],
      password: [
        "",
        Validators.compose([Validators.minLength(6), Validators.required])
      ]
    });
  }

  ngOnInit() {}

  async signupUser(signupForm: FormGroup): Promise<void> {
    if (!signupForm.valid) {
      console.log(
        "Need to complete the form, current value: ",
        signupForm.value
      );
    } else {
      const email: string = signupForm.value.email;
      const password: string = signupForm.value.password;
      const name: string = signupForm.value.name;

      this.authService.signupUser(email, password, name, this.userPhotoURL).then(
        () => {
          this.loading.dismiss().then(() => {
              // Check for any invitation pending for acceptance after sign up successfully.
              this.teamService.checkForInvitePending();
              this.router.navigate(['/']);
          });
        },
        error => {
          this.loading.dismiss().then(async () => {
            const alert = await this.alertCtrl.create({
              message: error.message,
              buttons: [{ text: "Ok", role: "cancel" }]
            });
            await alert.present();
          });
        }
      );
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
    }
  }
  async showUploadUserPicture() {
    const modal = await this.modalController.create({
      component: UploadPictureComponent,
      componentProps: {
        'userId': "new",
      }
    });
    const self = this;
    modal.onDidDismiss()
      .then((data) => {
        self.userPhotoURL = data['data'];
        console.log("data from modal",data)
        //this.submitProfileImage();
    });
    return await modal.present();
  }

}
