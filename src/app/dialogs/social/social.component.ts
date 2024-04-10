import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [MatDialogContent, MatDialogTitle, MatDialogClose, MatDialogActions, MatButton],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
