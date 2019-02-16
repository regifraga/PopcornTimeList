import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { tick } from '@angular/core/testing';
//import { Clipboard } from '@ionic-native/clipboard/index';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  private newLine = `
  `;

  items: any = [];
  popover: PopoverController;
  isTwitterOk: boolean = false;
  isEmailOk: boolean = false;
  isFacebookOk: boolean = false;
  isWhatsAppOk: boolean = false;
  
  constructor(
    public socialSharing: SocialSharing,
    private alertCtrl: AlertController,
    //private clipboard: Clipboard
  ) {
  }

  ngOnInit() {
    this.socialSharing.canShareVia('twitter').then(() => { this.isTwitterOk = true; }).catch(() => { this.isTwitterOk = false; });
    this.socialSharing.canShareViaEmail().then(() => { this.isEmailOk = true; }).catch(() => { this.isEmailOk = false; });
    this.socialSharing.canShareVia('facebook').then(() => { this.isFacebookOk = true; }).catch(() => { this.isFacebookOk = false; });
    this.socialSharing.canShareVia('whatsapp').then(() => { this.isWhatsAppOk = true; }).catch(() => { this.isWhatsAppOk = false; });
  }

  async presentAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      backdropDismiss: true,
      animated: true,
      header: 'Error',
      subHeader: 'We had a problem when we tried to get the job done! :(',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  sendToClipboard() {
    //this.clipboard.copy(this.getContentToShare());
    this.popover.dismiss();
  }

  async shareTwitter() {
    let torrents = this.getContentToShare();
    this.popover.dismiss();

    // Either URL or Image
    this.socialSharing.shareViaTwitter(torrents).then(() => {
      // Success
    }).catch((e) => {
      // Error!
      this.presentAlert(e);
    });
  }
 
  async shareWhatsApp() {
    let torrents = this.getContentToShare();
    this.popover.dismiss();

    // Text + Image or URL works
    this.socialSharing.shareViaWhatsApp(torrents).then(() => {
      // Success
    }).catch((e) => {
      // Error!
      this.presentAlert(e);
    });
  }
 
  async shareEmail() {
    let torrents = this.getContentToShare();
    this.popover.dismiss();
    
    this.socialSharing.shareViaEmail(torrents, 'Popcorn Time List - Torrent Share', []).then(() => {
      // Success
    }).catch((e) => {
      // Error!
      this.presentAlert(e);
    });
  }
 
  async shareFacebook() {
    let torrents = this.getContentToShare();
    this.popover.dismiss();

    // Image or URL works
    this.socialSharing.shareViaFacebook(torrents).then(() => {
    }).catch((e) => {
      // Error!
      this.presentAlert(e);
    });
  }

  getContentToShare() {
    const torrents = (this.items && this.items.torrents.length > 0) ? this.items.torrents.join(this.newLine + this.newLine) : '';
    const subtitles = (this.items && this.items.subtitles.length > 0) ? this.items.subtitles.join(this.newLine + this.newLine) : '';

    let totalFiles = (this.items && this.items.torrents && this.items.torrents.length > 0) ? this.items.torrents.length : 0;
    totalFiles += (this.items && this.items.subtitles && this.items.subtitles.length > 0) ? this.items.subtitles.length : 0;

    let result = 'Total Files: ' + totalFiles + this.newLine + this.newLine;

    result += (torrents.trim().length > 0) ? 'Torrents: ' + this.newLine + torrents + this.newLine: '';
    result += (subtitles.trim().length > 0) ? this.newLine + this.newLine + 'Subtitles: ' + this.newLine + this.newLine + subtitles + this.newLine: '';

    return result;
  }
}
