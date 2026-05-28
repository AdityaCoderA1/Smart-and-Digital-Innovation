import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Auth } from './pages/auth/auth';

import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard';

import { Challenges } from './pages/challenges/challenges';

import { RecyclingCenters } from './pages/recycling-centers/recycling-centers';

export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'auth',
    component: Auth
  },

  {
    path: 'user-dashboard',
    component: UserDashboardComponent
  },

  {
    path: 'challenges',
    component: Challenges
  },

  {
    path: 'recycling-centers',
    component: RecyclingCenters
  },

  {
    path: '**',
    redirectTo: ''
  }

];