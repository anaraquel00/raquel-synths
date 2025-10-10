import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [MatMenuModule, MatButtonModule, MatToolbar],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  afterMenu!: MatMenuPanel<any> | null;
  beforeMenu!: MatMenuPanel<any> | null;
  belowMenu!: MatMenuPanel<any> | null;

}
