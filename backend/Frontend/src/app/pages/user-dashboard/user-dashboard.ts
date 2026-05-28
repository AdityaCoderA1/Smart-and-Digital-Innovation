import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
// import {
//   RouterLink,
//   RouterLinkActive
// } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboardComponent implements OnInit {
  constructor(private router: Router) {}

  goToHome() {

    this.router.navigate(['/']);

  }
  currentSection = '';

  scrollToSection(sectionId: string, sectionName: string) {
    this.currentSection = sectionName;

    setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  }

  username: string = 'Guest';
  greeting: string = '';

  randomNames: string[] = [
    'Captain Compost',
    'Bin Ninja',
    'Trash Panda',
    'Garbage Guru',
    'Eco Champ',
    'Planet Saver',
    'Dustbin Hero',
    'Recycle Ranger',
    'Green Knight',
  ];

  stats = {
    uploaded: 0,
    detections: 0,
    challenges: 0,
    trips: 0,
  };

  wasteDistribution = [
    { label: 'Metal Waste', value: 0 },
    { label: 'E-Waste', value: 0 },
    { label: 'Plastic', value: 0 },
    { label: 'Cardboard', value: 0 },
    { label: 'Paper', value: 0 },
    { label: 'Organic', value: 0 },
  ];

  recycleStats = [
    { label: 'Recyclable', value: 0 },
    { label: 'Non-Recyclable', value: 0 },
  ];

  detectionHistory: any[] = [];

  leaderboard: any[] = [];

  ngOnInit(): void {
    const randomIndex = Math.floor(Math.random() * this.randomNames.length);

    this.username = this.randomNames[randomIndex];

    this.setGreeting();

    this.loadLeaderboard();
  }

  setGreeting(): void {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (hour < 21) {
      this.greeting = 'Good Evening';
    } else {
      this.greeting = 'Good Night';
    }
  }

  loadLeaderboard(): void {
    this.leaderboard = [
      {
        name: 'GreenAlex',
        badge: 'Gold Badge',
        role: 'Green Elite',
        medal: '🥇',
      },

      {
        name: 'SilverSam',
        badge: 'Silver Badge',
        role: 'Green Pro',
        medal: '🥈',
      },

      {
        name: 'BronzeBee',
        badge: 'Bronze Badge',
        role: 'Green Rookie',
        medal: '🥉',
      },
    ];
  }

  addUserToLeaderboard(user: any): void {
    if (this.leaderboard.length < 10) {
      this.leaderboard.push(user);
    }
  }

  scrollToAnalytics() {
    const section = document.getElementById('analytics-section');

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  scrollToLeaderboard() {
    const section = document.getElementById('leaderboard-section');

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }
}
