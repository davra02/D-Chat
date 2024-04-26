import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ethers } from 'ethers';

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

  

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
   
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
    }
  }

  async testConnection(): Promise<string> {
    const contractAddress = '0x5E12E0aB567cb85DC98c126094Fc30730b0b14Ec';
    const abi = '';
    await this.loadContract(abi, contractAddress);
    return this.contract['testConnection']();
  }

  async loadContract(abi: any, contractAddress: string) {
    this.contract = new ethers.Contract(contractAddress, abi, this.signer);
  }

  // Luego, crea una función para enviar mensajes (o cualquier otra interacción):
  async sendMessage(message: string) {
    const tx = await this.contract['sendMessage'](message);
    await tx.wait();
    console.log('Mensaje enviado:', message);
  }

  // Implementa más funciones aquí, como enviar un mensaje a tu contrato
}
