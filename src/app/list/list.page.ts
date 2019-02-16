import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

import * as _ from 'underscore';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public page = 1;
  private selectedMovie: any;
  public movies: Array<{ id: number; imdb: string; title: string; imageUrl: string; imageBigUrl: string; description: string; year: number; quality: string; rating: number; genres: string; items: any; ratingColor: string; runtime: string, trailer: string }> = [];

  constructor(private http: HttpClient, private navCtrl: NavController) {
    this.loadMovies();
  }

  loadMovies(callback?) {
    let self = this;
    let url = 'http://api.apiumadomain.xyz/list?cb=0.4723313860962022&sort=seeds&quality=720p,1080p,4k&app_id=T4P_AND&os=ANDROID&ver=2.8.0&page=' + this.page;

    self.http.get(url).subscribe((response) => {
      let movieList = [];

      try {
        if (response.hasOwnProperty('MovieList')) { 
          movieList = response['MovieList'];
        }
      } catch (error) {
        
      }

      for (let i = 0; i < movieList.length; i++) {
        let qualityList = [];
        //let torrentList = [];
        
        let torrentList = _.chain(movieList[i].items).sortBy('size_bytes').map(function(item) {
          qualityList.push(item.quality);

          return {
            quality: item.quality,
            size_bytes: self.humanFileSize(item.size_bytes, 2),
            torrent_peers: item.torrent_peers,
            torrent_seeds: item.torrent_seeds,
            torrent_magnet: item.torrent_magnet,
            isChecked: false
          };
        }).value();

        qualityList = _.intersection(qualityList);

        self.movies.push({
          id: movieList[i].id,
          imdb: movieList[i].imdb,
          title: movieList[i].title,
          imageUrl: movieList[i].poster_med,
          imageBigUrl: movieList[i].poster_big,
          description: movieList[i].description,
          year: movieList[i].year,
          quality: qualityList.join(', '),
          rating: movieList[i].rating,
          genres: movieList[i].genres.join(', '),
          items: torrentList,
          ratingColor: (+movieList[i].rating >= 9) ? 'primary' : (+movieList[i].rating >= 6) ? 'success' : (+movieList[i].rating > 4) ? 'warning' : 'danger',
          runtime: movieList[i].runtime.toString() + ' min',
          trailer: movieList[i].trailer
        });
      }

      self.page++;

      if (callback) {
          callback(self.movies);
      }
    });
  }

  selectMovie(movie: any) {
    this.selectedMovie = movie;

    //get subtitles
    let subtitleUrl = 'http://sub.apiumadomain.xyz/list?imdb=' + movie.imdb;

    this.http.get(subtitleUrl).subscribe((response) => {
      movie.subtitles = {
        pt_br: [],
        pt: []
      };

      try {
        if (response.hasOwnProperty('subs')) { 
          movie.subtitles.pt_br = _.chain(response['subs']['pb'])
                                  .map(function(item) { return item.url; })
                                  .value();

          movie.subtitles.pt = _.chain(response['subs']['pt'])
                              .map(function(item) { return item.url; })
                              .value();
        }
      } catch (error) {
        
      }

      let navigationExtras: NavigationExtras = {
        queryParams: {
          'selectedMovie': JSON.stringify(movie)
        }
      }
    
      this.navCtrl.navigateForward(['/detail', movie.imdb], navigationExtras);
    });
  }

  getMovieDetail(imdbId: string) {
    return _.findWhere(this.movies, function(movie) {
      return movie.imdb === imdbId;
    });
  }

  loadMore(event) {
    setTimeout(() => {
      this.loadMovies(function(movies){
        console.log('Movies loaded: ' + movies.length);

        // App logic to determine if all data is loaded
        // and disable the infinite scroll
        if (movies.length === 0) {
          event.target.disabled = true;
        }
      });

      event.target.complete();
    }, 500);
  }

  humanFileSize(size, decimalPoint) {
    if (size == 0) return '0 Bytes';

    let k = 1000,
    dm = decimalPoint || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  ngOnInit() {
  }
}
