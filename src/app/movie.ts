import { Subtitle } from "./subtitle";

export class Movie {
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
  subtitles: Subtitle;
}
