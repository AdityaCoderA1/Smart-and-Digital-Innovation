import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import {
//   RouterLink,
//   RouterLinkActive
// } from '@angular/router';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenges.html',
  styleUrls: ['./challenges.css'],
})
export class Challenges {
  scrollToTop(){

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}
  currentSection = '';

  scrollToProgress() {
    this.currentSection = 'progress';

    setTimeout(() => {
      const section = document.getElementById('your-progress-section');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  }

  randomQuotes: string[] = [
    'Every efficient loop you build removes friction from the planet.',
    'Small optimizations repeated daily become environmental impact at scale.',
    'The future belongs to products that reduce waste without reducing convenience.',
    'A cleaner process today becomes a better industry tomorrow.',
    'You are not just following consistency but you are building a more efficient cycle!',
    'Progress in sustainability is measured in loops closed, not promises made.',
  ];

  randomQuote = '';

  ecoProgress = 0;

  totalPoints = 0;

  showPopup = false;

  popupMessage = '';

  constructor() {
    const randomIndex = Math.floor(Math.random() * this.randomQuotes.length);

    this.randomQuote = this.randomQuotes[randomIndex];
  }

  progressiveChallenges = [
    {
      title: 'Recycle 5 Plastic Items',
      description: 'Upload and recycle plastic waste items correctly.',
      points: 5,
      current: 0,
      total: 5,
      progress: 0,
    },

    {
      title: 'Visit 1 Recycling Center',
      description: 'Check-in at a nearby eco recycling center.',
      points: 10,
      current: 0,
      total: 1,
      progress: 0,
    },

    {
      title: 'Recycle 10 Plastic Items',
      description: 'Continue your plastic recycling streak.',
      points: 15,
      current: 0,
      total: 10,
      progress: 0,
    },

    {
      title: 'Recycle 20 Paper/Cardboard Items',
      description: 'Segregate and recycle paper waste.',
      points: 20,
      current: 0,
      total: 20,
      progress: 0,
    },

    {
      title: 'Upload 15 Organic Waste Classification',
      description: 'Use AI organic waste classification correctly.',
      points: 25,
      current: 0,
      total: 15,
      progress: 0,
    },
  ];

  dailyChallenges = [
    {
      difficulty: 'Easy',
      title: 'Carry a Reusable Bottle',
      points: 10,
      completed: false,
    },

    {
      difficulty: 'Easy',
      title: 'Avoid Single-Use Plastic',
      points: 10,
      completed: false,
    },

    {
      difficulty: 'Medium',
      title: 'Plant One Small Seed',
      points: 50,
      completed: false,
    },

    {
      difficulty: 'Medium',
      title: 'Avoid Food Waste Today',
      points: 50,
      completed: false,
    },

    {
      difficulty: 'Hard',
      title: 'Spend a Day Without Plastic Bags',
      points: 100,
      completed: false,
    },

    {
      difficulty: 'Hard',
      title: 'Teach Someone Waste Segregation',
      points: 100,
      completed: false,
    },
  ];

  addProgress(challenge: any) {
    if (challenge.current < challenge.total) {
      challenge.current++;

      challenge.progress = Math.floor((challenge.current / challenge.total) * 100);

      this.updateOverallProgress();

      if (challenge.progress === 100) {
        this.totalPoints += challenge.points;

        this.popupMessage = `${challenge.title} Completed! +${challenge.points} pts`;

        this.triggerPopup();
      }
    }
  }

  completeDailyTask(task: any) {
    if (!task.completed) {
      task.completed = true;

      this.totalPoints += task.points;

      this.updateOverallProgress();

      this.popupMessage = `${task.title} Completed! +${task.points} pts`;

      this.triggerPopup();
    }
  }

  updateOverallProgress() {
    const completedProgressive = this.progressiveChallenges.filter(
      (c) => c.progress === 100,
    ).length;

    const completedDaily = this.dailyChallenges.filter((c) => c.completed).length;

    const totalCompleted = completedProgressive + completedDaily;

    const totalChallenges = this.progressiveChallenges.length + this.dailyChallenges.length;

    this.ecoProgress = Math.floor((totalCompleted / totalChallenges) * 100);
  }

  triggerPopup() {
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 2500);
  }
}
