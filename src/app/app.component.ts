import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // Importa ChatComponent aquí
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrige a styleUrls
})
export class AppComponent {
  title = 'DChat-Client';
}
