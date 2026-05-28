import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Challenge as ChallengeService } from '../../services/challenge';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenges.html',
  styleUrls: ['./challenges.css'],
})
export class Challenges implements OnInit {
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

  progressiveChallenges: any[] = [];
  dailyChallenges: any[] = [];

  constructor(private challengeService: ChallengeService) {
    const randomIndex = Math.floor(Math.random() * this.randomQuotes.length);

    this.randomQuote = this.randomQuotes[randomIndex];
  }

  ngOnInit(): void {
    this.loadChallenges();
    
    // Load initial user stats
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      // Wait, we need to get updated points/progress.
      // But we will update it when challenges are completed.
    }
  }

  loadChallenges() {
    this.challengeService.getChallenges().subscribe({
      next: (data) => {
        // Here we map backend challenges to frontend structure
        this.progressiveChallenges = data.filter((c: any) => c.type === 'progressive').map((c: any) => ({
            ...c,
            current: 0,
            total: c.total_goal || 5,
            progress: 0
        }));
        
        this.dailyChallenges = data.filter((c: any) => c.type === 'daily').map((c: any) => ({
            ...c,
            completed: false
        }));
      },
      error: (err) => console.error(err)
    });
  }

  addProgress(challenge: any) {
    if (challenge.current < challenge.total) {
      challenge.current++;

      challenge.progress = Math.floor((challenge.current / challenge.total) * 100);

      this.updateOverallProgress();

      if (challenge.progress === 100) {
        
        // Call backend to update progress
        this.challengeService.updateProgress(challenge._id).subscribe({
          next: (res) => {
            this.totalPoints = res.totalPoints;
            this.ecoProgress = res.ecoProgress;
            this.popupMessage = `${challenge.title} Completed! +${challenge.points} pts`;
            this.triggerPopup();
          },
          error: (err) => console.error(err)
        });

      }
    }
  }

  completeDailyTask(task: any) {
    if (!task.completed) {
      task.completed = true;

      this.updateOverallProgress();

      this.challengeService.updateProgress(task._id).subscribe({
          next: (res) => {
              this.totalPoints = res.totalPoints;
              this.ecoProgress = res.ecoProgress;
              this.popupMessage = `${task.title} Completed! +${task.points} pts`;
              this.triggerPopup();
          },
          error: (err) => console.error(err)
      });
    }
  }

  updateOverallProgress() {
    const completedProgressive = this.progressiveChallenges.filter(
      (c) => c.progress === 100,
    ).length;

    const completedDaily = this.dailyChallenges.filter((c) => c.completed).length;

    const totalCompleted = completedProgressive + completedDaily;

    const totalChallenges = this.progressiveChallenges.length + this.dailyChallenges.length;

    // This is a local visual update, backend provides actual ecoProgress upon completion
    if (totalChallenges > 0) {
        this.ecoProgress = Math.floor((totalCompleted / totalChallenges) * 100);
    }
  }

  triggerPopup() {
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 2500);
  }
}
