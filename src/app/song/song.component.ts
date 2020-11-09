import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from '../song';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html'
})
export class SongComponent implements OnInit {

  constructor(route: ActivatedRoute, http: HttpClient) {
    Song.load(http, route.snapshot.params["songId"]).then(song => this.song = song);
  }

  ngOnInit(): void {
  }

  song?: Song;
}
