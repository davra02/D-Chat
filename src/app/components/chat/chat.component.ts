import { Component, OnInit } from '@angular/core';
import { EthereumService } from '../../services/ethereum.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule aquí

@Component({
  selector: 'app-chat',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  message: string = '';

  constructor(private ethereumService: EthereumService) { }

  ngOnInit(): void {
    this.ethereumService.init();
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

  
}
