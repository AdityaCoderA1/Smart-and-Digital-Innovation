import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth as AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})

export class Auth {

  isLogin = true;
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  passwordMismatch = false;

  passwordStrength = 0;
  errorMessage = '';

  passwordLabel = 'Weak';

  constructor(private router: Router, private authService: AuthService) { }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  loginGuest() {
    this.router.navigate(['/user-dashboard']);
  }

  handleAuth() {

    if (!this.isLogin) {

      if (this.password !== this.confirmPassword) {

        this.passwordMismatch = true;
        return;

      }

      this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
        next: (res) => {
          localStorage.setItem('userToken', res.token);
          localStorage.setItem('userProfile', JSON.stringify(res));
          this.router.navigate(['/user-dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed';
        }
      });

    } else {

      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          localStorage.setItem('userToken', res.token);
          localStorage.setItem('userProfile', JSON.stringify(res));
          this.router.navigate(['/user-dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed';
        }
      });

    }

  }

  checkStrength(event: Event) {

    const input = event.target as HTMLInputElement;

    this.password = input.value;

    let strength = 0;

    if (this.password.length >= 6) {
      strength += 25;
    }

    if (/[A-Z]/.test(this.password)) {
      strength += 25;
    }

    if (/[0-9]/.test(this.password)) {
      strength += 25;
    }

    if (/[^A-Za-z0-9]/.test(this.password)) {
      strength += 25;
    }

    this.passwordStrength = strength;

    if (strength <= 25) {
      this.passwordLabel = 'Weak';
    }

    else if (strength <= 50) {
      this.passwordLabel = 'Medium';
    }

    else if (strength <= 75) {
      this.passwordLabel = 'Strong';
    }

    else {
      this.passwordLabel = 'Very Strong';
    }

  }

  checkConfirmPassword(event: Event) {

    const input = event.target as HTMLInputElement;

    this.confirmPassword = input.value;

    this.passwordMismatch =
      this.password !== this.confirmPassword;

  }

}