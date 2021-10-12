import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { AuthGuard } from './services/auth.guard';

import { HomePage } from './home/home.page';
import { ReflectComponent } from './components/reflect/reflect.component';
import { DrawComponent } from './components/draw/draw.component';
import { SelfComponent } from './components/self/self.component';
import { MemberComponent } from './components/member/member.component';
//import { ProfilePage } from './pages/profile/profile.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'draw/:id', component: DrawComponent, canActivate: [AuthGuard] },
  { path: 'chats/:id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'reflections/:id', component: ReflectComponent, canActivate: [AuthGuard] },
  { path: 'self-emotions/:id', component: SelfComponent, canActivate: [AuthGuard] },
  { path: 'member-emotions/:id', component: MemberComponent, canActivate: [AuthGuard] },
  { path: 'reset-password', loadChildren: './pages/reset-password/reset-password.module#ResetPasswordPageModule' },
  { path: 'signup', loadChildren: './pages/signup/signup.module#SignupPageModule' },
  { path: 'profile', loadChildren: './pages/profile/profile.module#ProfilePageModule' },
  //{ path: 'profile', component: ProfilePage },
  { path: 'privacy-policy', loadChildren: './pages/privacy-policy/privacy-policy.module#PrivacyPolicyPageModule' },
  { path: 'contact', loadChildren: './pages/contact/contact.module#ContactPageModule' },
  //{ path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
];

@NgModule({
  imports: [
    //RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
