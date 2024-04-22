import { Injectable } from '@angular/core';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private provider!: ethers.providers.Web3Provider;
  private signer!: ethers.Signer;
  private contract!: ethers.Contract;

  constructor() {
    this.init();
  }

  async init() {
    // Conectar al proveedor MetaMask
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      console.log('MetaMask is not installed');
    }
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
