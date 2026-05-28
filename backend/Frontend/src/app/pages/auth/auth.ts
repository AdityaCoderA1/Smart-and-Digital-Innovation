import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})

export class Auth {

  isLogin = true;

  password = '';

  passwordStrength = 0;

  passwordLabel = 'Weak';

  constructor(private router: Router){}

  toggleForm(){
    this.isLogin = !this.isLogin;
  }

  loginGuest(){
    this.router.navigate(['/user-dashboard']);
  }

  handleAuth(){

  if(!this.isLogin){

    if(this.password !== this.confirmPassword){

      this.passwordMismatch = true;
      return;

    }

  }

  this.router.navigate(['/user-dashboard']);

}

  checkStrength(event: Event){

    const input = event.target as HTMLInputElement;

    this.password = input.value;

    let strength = 0;

    if(this.password.length >= 6){
      strength += 25;
    }

    if(/[A-Z]/.test(this.password)){
      strength += 25;
    }

    if(/[0-9]/.test(this.password)){
      strength += 25;
    }

    if(/[^A-Za-z0-9]/.test(this.password)){
      strength += 25;
    }

    this.passwordStrength = strength;

    if(strength <= 25){
      this.passwordLabel = 'Weak';
    }

    else if(strength <= 50){
      this.passwordLabel = 'Medium';
    }

    else if(strength <= 75){
      this.passwordLabel = 'Strong';
    }

    else{
      this.passwordLabel = 'Very Strong';
    }

  }
  
  checkConfirmPassword(event: Event){

  const input = event.target as HTMLInputElement;

  this.confirmPassword = input.value;

  this.passwordMismatch =
    this.password !== this.confirmPassword;

}
  confirmPassword = '';

passwordMismatch = false;

}