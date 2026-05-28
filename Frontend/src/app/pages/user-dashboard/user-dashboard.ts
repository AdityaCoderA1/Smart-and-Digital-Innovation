import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboardComponent implements OnInit {
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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadUserProfile();
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

  loadUserProfile(): void {
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
        try {
            const parsed = JSON.parse(cachedProfile);
            if (parsed.username) {
                this.username = parsed.username;
            }
        } catch(e) {}
    }

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.stats = {
            uploaded: profile.stats?.uploaded || 0,
            detections: profile.stats?.detections || 0,
            challenges: profile.stats?.challenges || 0,
            trips: profile.stats?.trips || 0,
        };
        
        if (profile.wasteDistribution && profile.wasteDistribution.length > 0) {
            this.wasteDistribution = profile.wasteDistribution;
        }
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      }
    });
  }

  loadLeaderboard(): void {
    this.userService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data.map((user: any, index: number) => {
            let badge = 'Bronze Badge';
            let role = 'Green Rookie';
            let medal = '🥉';
            if (index === 0) { badge = 'Gold Badge'; role = 'Green Elite'; medal = '🥇'; }
            else if (index === 1) { badge = 'Silver Badge'; role = 'Green Pro'; medal = '🥈'; }
            
            return {
                name: user.username,
                badge,
                role,
                medal,
                points: user.totalPoints
            };
        });
      },
      error: (err) => {
        console.error('Failed to load leaderboard', err);
      }
    });
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
