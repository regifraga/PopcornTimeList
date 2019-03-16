import { Injectable } from "@angular/core";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

import { LoadingController } from "@ionic/angular";

import { Movie } from "./movie";
import { Util } from "./util";
import * as _ from "underscore";
import { load } from "@angular/core/src/render3";
import { Subtitle } from "./subtitle";

@Injectable({
  providedIn: "root"
})
export class MovieService {
  constructor(
    private http: HttpClient,
    public loadingCtrl: LoadingController
  ) {}

  getSubtitles(url: string): Observable<Subtitle> {
    return this.http.get<Subtitle>(url);
  }
  getMovies(url: string, callback?: any): Movie[] {
    const movies: Array<Movie> = [];

    this.http.get<Movie[]>(url).subscribe(async response => {
      const loading = await this.loadingCtrl.create({
        spinner: "crescent",
        message: "Loading..."
      });

      loading.present();

      let movieList = [];

      try {
        if (response.hasOwnProperty("MovieList")) {
          movieList = response["MovieList"];
        }
      } catch (error) {}

      for (let i = 0; i < movieList.length; i++) {
        let qualityList = [];
        let torrentList = _.chain(movieList[i].items)
          .sortBy("size_bytes")
          .map(function(item) {
            qualityList.push(item.quality);

            return {
              quality: item.quality,
              size_bytes: Util.humanFileSize(item.size_bytes, 2),
              torrent_peers: item.torrent_peers,
              torrent_seeds: item.torrent_seeds,
              torrent_magnet: item.torrent_magnet,
              isChecked: false
            };
          })
          .value();

        qualityList = _.intersection(qualityList);

        movies.push(<Movie>{
          id: movieList[i].id,
          imdb: movieList[i].imdb,
          title: movieList[i].title,
          actors: movieList[i].actors,
          imageUrl: movieList[i].poster_med,
          imageBigUrl: movieList[i].poster_big,
          description: movieList[i].description,
          year: movieList[i].year,
          quality: qualityList.join(", "),
          rating: movieList[i].rating,
          genres: movieList[i].genres.join(", "),
          items: torrentList,
          ratingColor:
            +movieList[i].rating >= 9
              ? "primary"
              : +movieList[i].rating >= 6
              ? "success"
              : +movieList[i].rating > 4
              ? "warning"
              : "danger",
          runtime: movieList[i].runtime.toString() + " min",
          trailer: movieList[i].trailer
        });
      }

      await loading.dismiss();
      // this.page++;
      if (callback) {
        callback(movies);
      }
    });

    return movies;
  }
}
