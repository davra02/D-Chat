import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { abi } from '../../DChat/build/contracts/SimpleChat.json';
import { contractAddress } from '../../DChat/contract-address.json';
import { Router } from '@angular/router';

declare global {
  interface Window { ethereum: any; }
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private provider!: ethers.providers.Web3Provider;
  private signer!: ethers.Signer;
  private contract!: ethers.Contract;

  

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
   
  }

  async init() {
    // Verificar si estamos en el navegador
    
    if (isPlatformBrowser(this.platformId) && window.ethereum) {
      try {  
        console.log("Hola en el navegador")
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert("MetaMask is not installed")
      this.router.navigate(['/']);
    }
  }

  async getUserAddress(): Promise<string> {
    return this.signer.getAddress();
  }

  async checkRegistered(): Promise<boolean> {
    await this.loadContract(abi, contractAddress);
    return this.contract['checkRegistered']();
  }

  async register(name: string) {
    await this.loadContract(abi, contractAddress);
    const address = await this.signer.getAddress();
    const tx = await this.contract['register'](name, { from: address });
    await tx.wait();
    console.log('Usuario registrado:', name);
  }

  async loadContract(abi: any, contractAddress: string) {
    this.contract = new ethers.Contract(contractAddress, abi, this.signer);
  }

  // Luego, crea una función para enviar mensajes (o cualquier otra interacción):
  async sendMessage(chatId: BigNumber, message: string) {
    const tx = await this.contract['sendMessage'](chatId, message);
    await tx.wait();
    console.log('Mensaje enviado:', message);
}

  //Para desarrollo
  async testConnection(): Promise<string> {
    await this.loadContract(abi, contractAddress);
    return this.contract['testConnection']();
  }

  async getMyChats(): Promise<any> {
    await this.loadContract(abi, contractAddress);
    const address = await this.signer.getAddress();
    return this.contract['getMyChats']({ from: address });
  }

  async getChatMessages(chatId: BigNumber): Promise<any> {
    await this.loadContract(abi, contractAddress);
    const address = await this.signer.getAddress();
    return this.contract['getChatMessages'](chatId, { from: address });
  }

  async createChatByName(participantNames: string[]): Promise<any> {
    await this.loadContract(abi, contractAddress);
    const address = await this.signer.getAddress();
    return this.contract['createChatByName'](participantNames, { from: address });
  }

  async getMyName(): Promise<string> {
      await this.loadContract(abi, contractAddress);
      const address = await this.signer.getAddress();
      return this.contract['getMyName']({ from: address });
  }

  async leaveChat(chatId: BigNumber): Promise<any> {
      await this.loadContract(abi, contractAddress);
      const address = await this.signer.getAddress();
      const tx = await this.contract['leaveChat'](chatId, { from: address });
      await tx.wait();
      console.log(`Left chat with ID: ${chatId}`);
  }

  async deleteChat(chatId: BigNumber): Promise<any> {
      await this.loadContract(abi, contractAddress);
      const address = await this.signer.getAddress();
      const tx = await this.contract['deleteChat'](chatId, { from: address });
      await tx.wait();
      console.log(`Deleted chat with ID: ${chatId}`);
  }

  

  async listenToChatEvents(): Promise<void> {
      const address = await this.signer.getAddress();

      this.contract.on('ChatCreated', async (chatId, creator) => {
          const isParticipant = await this.contract['isParticipant'](chatId, address);
          if (isParticipant) {
              console.log(`Chat created with ID: ${chatId}`);
          }
      });

      this.contract.on('MessageSent', async (chatId, messageId, sender, senderName, content, timestamp) => {
          const isParticipant = await this.contract['isParticipant'](chatId, address);
          if (isParticipant) {
              console.log(`Message sent in chat ${chatId} with ID: ${messageId}`);
          }
      });
  }

  // En EthereumService
  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  listenToChatCreatedEvent(callback: (chatId: string, creator: string) => void): void {
      this.contract.on('ChatCreated', callback);
  }

  listenToMessageSentEvent(callback: (chatId: string, messageId: string, sender: string, senderName: string, content: string, timestamp: string) => void): void {
      this.contract.on('MessageSent', callback);
  }

  async isParticipant(chatId: string): Promise<boolean> {
      const address = await this.signer.getAddress();
      const isParticipant = await this.contract['isParticipant'](chatId, address);
      return isParticipant;
  }

}
