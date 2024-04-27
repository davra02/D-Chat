import { Component, OnInit } from '@angular/core';
import { EthereumService } from '../../services/ethereum.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule aquí
import { Router, RouterModule } from '@angular/router';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone:true,
  imports: [FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  message: string = '';

  constructor(private ethereumService: EthereumService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    await this.ethereumService.init();
    this.checkRegistered().subscribe({
      next: (registered) => {
        if (!registered) {
          this.router.navigate(['/register']);
        }
      },
      error: (error) => {
        console.error('Error checking registration:', error);
      }
    })
  }

  async sendMessage(): Promise<void> {
    if (this.message.trim() === '') {
      console.log('Please enter a message');
      return;
    }

    try {
      await this.ethereumService.sendMessage(this.message);
      this.message = ''; // Clear the message input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  checkRegistered(): Observable<Boolean> {
    return from(
      this.ethereumService.checkRegistered().then(response => {
        console.log('User registered:', response);
        return response;
      }).catch(error => {
        console.error('Error checking registration:', error);
        return false;
      })
    );
  }
  async testConnection(): Promise<void> {
    try {
      const response = await this.ethereumService.testConnection();
      console.log('Connection test:', response);
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  }

  
}
