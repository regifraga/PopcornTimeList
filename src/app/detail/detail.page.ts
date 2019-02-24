import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { ShareComponent } from '../share/share.component';

import * as _ from 'underscore';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  public movieId: string = '';
  public selectedMovie: any;
  public hasItemSelected: boolean;
  
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    public popoverController: PopoverController,
    public loadingCtrl: LoadingController
  ) {
  }
  
  share() {
    const torrents = this.getSelectedTorrents();
    const subtitles = this.getSelectedSubtitles();
    const dataToShare = { torrents, subtitles }

    if (dataToShare) {
      console.dir(dataToShare);
      this.openPopover(dataToShare);
    }
  }

  getSelectedTorrents() {
    return _.chain(this.selectedMovie.items)
            .where({ isChecked: true })
            .map(function(item) { return item.torrent_magnet; })
            .value();
  }

  getSelectedSubtitles() {
    if (this.selectedMovie.subtitles.pt_br.length > 0) {
      return this.selectedMovie.subtitles.pt_br;
    }
    if (this.selectedMovie.subtitles.pt.length > 0) {
      return this.selectedMovie.subtitles.pt;
    }
    else {
      return [];
    }
  }

  updateSelected() {
    let torrentsToShare = this.getSelectedTorrents();
    this.hasItemSelected = (torrentsToShare.length > 0);
  }

  async openPopover(args: any) {
    const popover = await this.popoverController.create({
      component: ShareComponent,
      componentProps: { items: args, popover: this.popoverController },
      event: args,
      translucent: false,
      showBackdrop: true
    });

    return await popover.present();
  }

  async onDismiss() {
    try {
        await this.popoverController.dismiss();
    } catch (e) {
        //click more than one time popover throws error, so ignore...
    }

  }

  ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe(params => {
      if (params["selectedMovie"]) {
        this.selectedMovie = JSON.parse(params["selectedMovie"]);
      }
    });
  
    console.log(`DETAIL PAGE = ${this.movieId}`);
  }

}
