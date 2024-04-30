import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EthereumService } from '../../services/ethereum.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule aquí
import { Router, RouterModule } from '@angular/router';
import { Observable, from } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { BigNumber } from 'ethers';
import { SrvRecord } from 'dns';


@Component({
  selector: 'app-chat',
  standalone:true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  message: string = '';
  participantNames: string[] = [''];
  chats: any[] = [];
  currentChat: BigNumber = BigNumber.from(-1);
  chatMessages: any[] = [];
  currentUser: string = '';
  public openedDropdown: BigNumber | null = null;


  constructor(private ethereumService: EthereumService, private router: Router, private modalService: NgbModal) { }


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
    await this.getMyName();
    await this.getMyChats();
    this.listenToChatEvents();
  }

  addParticipant(): void {
    if (this.participantNames[this.participantNames.length - 1].trim() !== '') {
      this.participantNames.push('');
    }
  }
  
  removeParticipant(index: number): void {
    if (this.participantNames.length > 1) {
      this.participantNames.splice(index, 1);
    }
  }

  resetParticipants(): void {
    this.participantNames = [''];
  }

  async sendMessage(): Promise<void> {
    if (this.message.trim() === '') {
      console.log('Please enter a message');
      return;
    }

    try {
      console.log('Sending message:', this.message);
      await this.ethereumService.sendMessage(this.currentChat, this.message);
      this.message = ''; // Clear the message input after sending
      await this.getChatMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async getMyName(): Promise<void> {
    try {
        const myName = await this.ethereumService.getMyName();
        this.currentUser = myName;
    } catch (error) {
        console.error('Error getting my name:', error);
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

  async createChat(createChatModal: TemplateRef<any>): Promise<void> {
    this.resetParticipants();
    const modalRef = this.modalService.open(createChatModal);
    modalRef.result.then(async () => {
      try {
        await this.ethereumService.createChatByName(this.participantNames);
        console.log('Chat created successfully');
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }).catch((reason) => {
      if (reason !== 'Cross click') {
        console.error('Error opening modal:', reason);
      }
    });
  }

  isAnyParticipantEmpty(): boolean {
    return this.participantNames.some(name => name.trim() === '');
  }

  selectChat(chatId: BigNumber) {
      this.currentChat = chatId;
      this.getChatMessages();
      console.log('Chat selected:', this.currentChat.toNumber());
  }


  async getChatMessages(): Promise<void> {
    try {
      const messages = await this.ethereumService.getChatMessages(this.currentChat);
      this.chatMessages = messages
      console.log('Chat messages:', this.chatMessages);
    } catch (error) {
      console.error('Error getting chat messages:', error);
    }
  }

  
  async getMyChats(): Promise<void> {
    try {
      this.chats = await this.ethereumService.getMyChats();
      console.log('My chats:', this.chats);
    } catch (error) {
      console.error('Error getting my chats:', error);
    }
  }

  getChatName(chat: any){
    let name = '';
    if(chat.participants.length == 2){
      for(const p of chat.participants){
        if(p.userName != this.currentUser){
          name = p.userName;
        }
      }
    } else {
      name = chat.participants.join(', ');
    }
    return name;
  }

  async deleteChat(chatId: BigNumber): Promise<void> {
    try {
      await this.ethereumService.deleteChat(chatId);
      console.log(`Chat with ID: ${chatId} deleted`);
      // Refresh the chat list after deletion
      this.getMyChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }
  
  async leaveChat(chatId: BigNumber): Promise<void> {
    try {
      await this.ethereumService.leaveChat(chatId);
      console.log(`Left chat with ID: ${chatId}`);
      await this.getMyChats();
      // Refresh the chat list after leaving
      this.getMyChats();
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  }

  trackByFn(index: number): number {
    return index;
  }

  async testConnection(): Promise<void> {
    try {
      const response = await this.ethereumService.testConnection();
      console.log('Connection test:', response);
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  }
  toggleDropdown(chatId: BigNumber): void {
    if (this.openedDropdown === chatId) {
      this.openedDropdown = null;
    } else {
      this.openedDropdown = chatId;
    }
  }

  async listenToChatEvents(): Promise<void> {

      this.ethereumService.listenToChatCreatedEvent(async (chatId, creator) => {
          const isParticipant = await this.ethereumService.isParticipant(chatId);
          if (isParticipant) {
              console.log(`Chat created with ID: ${chatId}`);
              // Update your component state here
              this.getMyChats();
          }
      });

      this.ethereumService.listenToMessageSentEvent(async (chatId, messageId, sender, senderName, content, timestamp) => {
          const isParticipant = await this.ethereumService.isParticipant(chatId);
          if (isParticipant) {
              console.log(`Message sent in chat ${chatId} with ID: ${messageId}`);
              // Update your component state here
              this.getChatMessages();
          }
      });
  }
  


}
