import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";
//import { environment } from "../environments/environment";
import { ChatComponent } from "./components/chat/chat.component";

import { HttpClientModule } from "@angular/common/http";
import { HomePage } from "./home/home.page";
import { MessageIntentionComponent } from "./components/message-intention/message-intention.component";
import { ReflectComponent } from "./components/reflect/reflect.component";
import { SelfComponent } from "./components/self/self.component";
import { MemberComponent } from "./components/member/member.component";
import { UploadFormComponent } from "./components/upload-form/upload-form.component";
import { UploadPictureComponent } from "./components/upload-picture/upload-picture.component";
import {DrawComponent} from "./components/draw/draw.component"
import { FileSizeFormatPipe } from "./components/upload-form/file-size-format.pipe";

import { Camera } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";

// Instructions ---->
// Replace configPlaceholder with environment.firebase
import { environment } from '../environments/environment';
//import { GroupStatisticsComponent } from './components/group-statistics/group-statistics.component';
import { MediaCaptureComponent } from './components/media-capture/media-capture.component';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { PoLPsComponent } from './components/po-lps/po-lps.component';
import { TextComponent } from './components/text/text.component';
import {CreateTeamComponent} from "./components/create-team/create-team.component";
import {Deeplinks} from "@ionic-native/deeplinks/ngx";
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    HomePage,
    SelfComponent,
    MemberComponent,
    MessageIntentionComponent,
    ReflectComponent,
    UploadFormComponent,
    UploadPictureComponent,
    DrawComponent,
    CalculatorComponent,
    FileSizeFormatPipe,
    //GroupStatisticsComponent,
    PoLPsComponent,
    MediaCaptureComponent,
    TextComponent,
    CreateTeamComponent
  ],
  entryComponents: [MessageIntentionComponent, TextComponent, UploadFormComponent, CalculatorComponent, UploadPictureComponent, PoLPsComponent, CreateTeamComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),

    AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase, "co-lab"), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    File,
    FirebaseX,
    Deeplinks,
      FirebaseDynamicLinks,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  
  bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
