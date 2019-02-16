import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
//import { Clipboard } from '@ionic-native/clipboard/index';
// import { File } from '@ionic-native/file/ngx';

import { ShareComponent } from './share/share.component';

@NgModule({
  declarations: [AppComponent, ShareComponent],
  entryComponents: [ShareComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SocialSharing,
    //Clipboard,
    // File
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
