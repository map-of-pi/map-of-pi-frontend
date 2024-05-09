import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LeafletModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    LeafletModule,
    TranslateModule,
    HttpClientModule
  ]
})
export class SharedModule {}