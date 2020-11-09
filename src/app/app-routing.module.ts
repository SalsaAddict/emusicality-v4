import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SongComponent } from './song/song.component';

const routes: Routes = [
  //{ path: 'home', component: HomeComponent },
  { path: 'songs/:songId', component: SongComponent },
  { path: '', redirectTo: '/songs/esoesamor', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
