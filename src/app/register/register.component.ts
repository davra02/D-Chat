import { FormGroup, FormControl, Validators, FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EthereumService } from '../services/ethereum.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, from } from 'rxjs';


@Component({
  selector: 'app-register',
  standalone:true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  
  accountAddress!: string;
  registerForm: FormGroup;

  constructor(private ethereumService: EthereumService, private router: Router, private formBuilder: FormBuilder) {
    
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    
    await this.ethereumService.init();

    this.checkRegistered().subscribe({
      next: (registered) => {
        if (registered) {
          this.router.navigate(['/chat']);
        }
      },
      error: (error) => {
        console.error('Error checking registration:', error);
      }
    })

    this.accountAddress = await this.ethereumService.getUserAddress();

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      // other controls...
    });

  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      await this.ethereumService.register(this.registerForm.value.name);
      this.router.navigate(['/chat']);
      
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
}