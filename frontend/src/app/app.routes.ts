import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login/acheteur', pathMatch: 'full' },

  // Auth routes
  {
    path: 'auth',
    children: [
      { path: 'login/admin', loadComponent: () => import('./auth/components/login-admin/login-admin.component').then(m => m.LoginAdminComponent) },
      { path: 'login/boutique', loadComponent: () => import('./auth/components/login-boutique/login-boutique.component').then(m => m.LoginBoutiqueComponent) },
      { path: 'login/acheteur', loadComponent: () => import('./auth/components/login-acheteur/login-acheteur.component').then(m => m.LoginAcheteurComponent) },
      { path: 'logout', loadComponent: () => import('./auth/components/logout/logout.component').then(m => m.LogoutComponent) },
    ]
  },

  {
    path: 'home',
    component: Layout,
    children: [
      { path: '', component: Home },
    ]
  },
];
