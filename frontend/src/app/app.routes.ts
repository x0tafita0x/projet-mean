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
      { path: 'register/acheteur', loadComponent: () => import('./auth/components/register-acheteur/register-acheteur.component').then(m => m.RegisterAcheteurComponent) },
      { path: 'logout', loadComponent: () => import('./auth/components/logout/logout.component').then(m => m.LogoutComponent) },
    ]
  },

  {
    path: 'home',
    component: Layout,
    children: [
      { path: '', component: Home },

      // TypeProduit routes
      { path: 'type-produit', loadComponent: () => import('./produit/components/type-produit-list/type-produit-list.component').then(m => m.TypeProduitListComponent) },
      { path: 'type-produit/new', loadComponent: () => import('./produit/components/type-produit-form/type-produit-form.component').then(m => m.TypeProduitFormComponent) },
      { path: 'type-produit/edit/:id', loadComponent: () => import('./produit/components/type-produit-form/type-produit-form.component').then(m => m.TypeProduitFormComponent) },

      // SousTypeProduit routes
      { path: 'sous-type-produit', loadComponent: () => import('./produit/components/sous-type-produit-list/sous-type-produit-list.component').then(m => m.SousTypeProduitListComponent) },
      { path: 'sous-type-produit/new', loadComponent: () => import('./produit/components/sous-type-produit-form/sous-type-produit-form.component').then(m => m.SousTypeProduitFormComponent) },
      { path: 'sous-type-produit/edit/:id', loadComponent: () => import('./produit/components/sous-type-produit-form/sous-type-produit-form.component').then(m => m.SousTypeProduitFormComponent) },

      // Produit routes
      { path: 'produit', loadComponent: () => import('./produit/components/produit-list/produit-list.component').then(m => m.ProduitListComponent) },
      { path: 'produit/new', loadComponent: () => import('./produit/components/produit-form/produit-form.component').then(m => m.ProduitFormComponent) },
      { path: 'produit/edit/:id', loadComponent: () => import('./produit/components/produit-form/produit-form.component').then(m => m.ProduitFormComponent) },
      { path: 'produitByBoutique/:id', loadComponent: () => import('./produit/components/produit-list-acheteur/produit-list-acheteur.component').then(m => m.ProduitListAcheteurComponent) },
      
      // Panier routes
      { path: 'panier', loadComponent: () => import('./panier/components/panier-list/panier-list.component').then(m => m.PanierListComponent) },
      { path: 'panier/validation', loadComponent: () => import('./panier/components/panier-validation/panier-validation.component').then(m => m.PanierValidationComponent) },
      { path: 'etat', loadComponent: () => import('./panier/components/etat-list/etat-list.component').then(m => m.EtatListComponent) },
      { path: 'etat/new', loadComponent: () => import('./panier/components/etat-form/etat-form.component').then(m => m.EtatFormComponent) },
      { path: 'etat/edit/:id', loadComponent: () => import('./panier/components/etat-form/etat-form.component').then(m => m.EtatFormComponent) },
      
      // Achat routes
      { path: 'achat', loadComponent: () => import('./achat/components/achat-list/achat-list.component').then(m => m.AchatListComponent) },
      { path: 'achat-details/:id', loadComponent: () => import('./achat/components/achat-details/achat-details.component').then(m => m.AchatDetailsComponent) },

      // Stock routes
      { path: 'stock', loadComponent: () => import('./stock/components/stock-list/stock-list.component').then(m => m.StockListComponent) },
      { path: 'produits-avec-stock', loadComponent: () => import('./stock/components/stock-list-by-produit/stock-list-by-produit.component').then(m => m.StockListComponentByProduit) },
      { path: 'stock/new', loadComponent: () => import('./stock/components/stock-form/stock-form.component').then(m => m.StockFormComponent) },

      // MouvementPrixProduit routes
      { path: 'mouvement-prix-produit', loadComponent: () => import('./mouvement-prix-produit/components/mouvement-prix-produit-list/mouvement-prix-produit-list.component').then(m => m.MouvementPrixProduitListComponent) },
      { path: 'prix-actuel', loadComponent: () => import('./mouvement-prix-produit/components/mouvement-prix-produit-list-by-produit/mouvement-prix-produit-list-by-produit.component').then(m => m.MouvementPrixProduitListByProduitComponent) },

      // TypeBoutique routes
      { path: 'type-boutique', loadComponent: () => import('./boutique/components/type-boutique-list/type-boutique-list.component').then(m => m.TypeBoutiqueListComponent) },
      { path: 'type-boutique/new', loadComponent: () => import('./boutique/components/type-boutique-form/type-boutique-form.component').then(m => m.TypeBoutiqueFormComponent) },
      { path: 'type-boutique/edit/:id', loadComponent: () => import('./boutique/components/type-boutique-form/type-boutique-form.component').then(m => m.TypeBoutiqueFormComponent) },

      // Boutique routes
      { path: 'boutique', loadComponent: () => import('./boutique/components/boutique-list/boutique-list.component').then(m => m.BoutiqueListComponent) },
      { path: 'boutique/new', loadComponent: () => import('./boutique/components/boutique-form/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      { path: 'boutique/edit/:id', loadComponent: () => import('./boutique/components/boutique-form/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      
    ]
  },
];
