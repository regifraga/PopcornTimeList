import { Component, ViewChild, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  IonInfiniteScroll,
  NavController,
  LoadingController,
  IonContent,
  ActionSheetController
} from "@ionic/angular";
import { NavigationExtras } from "@angular/router";
import { ActionSheetButton } from "@ionic/core";

import * as _ from "underscore";

let genresActionSheetButton: Array<ActionSheetButton> = [];
let sortByListActionSheetButton: Array<ActionSheetButton> = [];

@Component({
  selector: "app-list",
  templateUrl: "list.page.html",
  styleUrls: ["list.page.scss"]
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonContent) pageTop: IonContent;

  private loading: any;
  private selectedMovie: any;
  public searchTerm: string;
  public genre: string;
  public sortBy: string;
  public page = 1;
  public movies: Array<{
    id: number;
    imdb: string;
    title: string;
    actors: string;
    imageUrl: string;
    imageBigUrl: string;
    description: string;
    year: number;
    quality: string;
    rating: number;
    genres: string;
    items: any;
    ratingColor: string;
    runtime: string;
    trailer: string;
  }> = [];
  private genres: Array<string>;
  private sortByList: Array<string>;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController
  ) {
    const self = this;
    const actionSheetCancelButton = {
      text: "Cancel",
      icon: "close",
      role: "cancel",
      handler: () => {
        console.log("Cancel clicked");
      }
    };

    this.sortByList = ["Popularity", "Date added", "Year"];

    _.each(this.sortByList, function(sortBy) {
      sortByListActionSheetButton.push({
        text: sortBy,
        icon: undefined,
        role: undefined,
        handler: () => {
          console.log(sortBy);
          self.searchTerm = "";
          self.movies = [];
          self.page = 1;
          self.sortBy = sortBy;
          self.loadMovies();
        }
      });
    });

    sortByListActionSheetButton.push(actionSheetCancelButton);

    this.genres = [
      "All",
      "Action",
      "Adventure",
      "Animation",
      "Biography",
      "Comedy",
      "Crime",
      "Documentary",
      "Drama",
      "Family",
      "Fantasy",
      "Film-Noir",
      "History",
      "Horror",
      "Music",
      "Musical",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Short",
      "Sport",
      "Thriller",
      "War",
      "Western"
    ];

    _.each(this.genres, function(genre) {
      genresActionSheetButton.push({
        text: genre,
        icon: undefined,
        role: undefined,
        handler: () => {
          console.log(genre);
          self.searchTerm = "";
          self.movies = [];
          self.page = 1;
          self.genre = genre;
          self.loadMovies();
        }
      });
    });

    genresActionSheetButton.push(actionSheetCancelButton);

    this.genre = this.genres[0];
    this.sortBy = this.sortByList[0];

    this.loadMovies();
  }

  public pageScroller() {
    this.pageTop.scrollToTop();
  }

  async showFilters() {
    const self = this;

    const actionSheet = await this.actionSheetCtrl.create({
      header: "Genres: " + self.genre,
      buttons: genresActionSheetButton
    });

    await actionSheet.present();
  }

  async showSortBy() {
    const self = this;

    const actionSheet = await this.actionSheetCtrl.create({
      header: "Sort By: " + self.sortBy,
      buttons: sortByListActionSheetButton
    });

    await actionSheet.present();
  }

  clearFilter() {
    this.searchTerm = "";
    this.genre = "seeds";
    this.movies = [];
    this.page = 1;
    this.loadMovies();
  }

  filterMovies(event) {
    this.searchTerm = event.srcElement.value;

    if (!this.searchTerm || this.searchTerm.length <= 3) {
      return;
    }
    this.movies = [];
    this.page = 1;
    this.loadMovies();
  }

  refresh(event) {
    this.loadMovies(function() {
      event.target.complete();
    });
  }

  async loadMovies(callback?) {
    const loading = await this.loadingCtrl.create({
      spinner: "crescent",
      message: "Loading..."
    });

    loading.present();

    let self = this;
    const searchParam = this.searchTerm
      ? "&keywords=" + this.searchTerm.trim().replace(new RegExp(" ", "g"), "+")
      : "";
    const genreParam =
      this.genre && this.genre !== this.genres[0]
        ? "&genre=" + this.genre.trim()
        : "";
    const sortByParam =
      this.sortBy && this.sortBy !== this.sortByList[0]
        ? "&sort=" +
          this.sortBy
            .trim()
            .toLowerCase()
            .replace(new RegExp(" ", "g"), "")
        : "&sort=seeds";

    if (searchParam) {
      self.page = 1;
    }

    let url =
      "http://api.apiumadomain.xyz/list?cb=0.4723313860962022" +
      sortByParam +
      genreParam +
      searchParam +
      "&quality=720p,1080p,4k&app_id=T4P_AND&os=ANDROID&ver=2.8.0&page=" +
      this.page;

    console.log(url);

    self.http.get(url).subscribe(response => {
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
              size_bytes: self.humanFileSize(item.size_bytes, 2),
              torrent_peers: item.torrent_peers,
              torrent_seeds: item.torrent_seeds,
              torrent_magnet: item.torrent_magnet,
              isChecked: false
            };
          })
          .value();

        qualityList = _.intersection(qualityList);

        self.movies.push({
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

      self.page++;

      loading.dismiss();

      if (callback) {
        callback(self.movies);
      }
    });
  }

  async selectMovie(movie: any) {
    const loadingDetail = await this.loadingCtrl.create({
      spinner: "crescent",
      message: "Loading..."
    });

    loadingDetail.present();
    const self = this;
    this.selectedMovie = movie;

    //get subtitles
    let subtitleUrl = "http://sub.apiumadomain.xyz/list?imdb=" + movie.imdb;

    this.http.get(subtitleUrl).subscribe(async response => {
      movie.subtitles = {
        pt_br: [],
        pt: []
      };

      try {
        if (response.hasOwnProperty("subs")) {
          movie.subtitles.pt_br = _.chain(response["subs"]["pb"])
            .map(function(item) {
              return item.url;
            })
            .value();

          movie.subtitles.pt = _.chain(response["subs"]["pt"])
            .map(function(item) {
              return item.url;
            })
            .value();
        }
      } catch (error) {}

      let navigationExtras: NavigationExtras = {
        queryParams: {
          selectedMovie: JSON.stringify(movie)
        }
      };

      this.navCtrl
        .navigateForward(["/detail", movie.imdb], navigationExtras)
        .finally(function() {
          loadingDetail.dismiss();
        });
    });
  }

  getMovieDetail(imdbId: string) {
    return _.findWhere(this.movies, function(movie) {
      return movie.imdb === imdbId;
    });
  }

  loadMore(event) {
    setTimeout(() => {
      this.loadMovies(function(movies) {
        console.log("Movies loaded: " + movies.length);

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
    if (size == 0) return "0 Bytes";

    let k = 1000,
      dm = decimalPoint || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  ngOnInit() {}
}
