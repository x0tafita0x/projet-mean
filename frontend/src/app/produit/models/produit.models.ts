import { inject } from '@angular/core';
import { Boutique } from '../../boutique/models/boutique.models';

export interface TypeProduit {
    _id?: string;
    nom: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SousTypeProduit {
    _id?: string;
    nom: string;
    typeProduit: string | TypeProduit;
    createdAt?: string;
    updatedAt?: string;
}

export interface Produit {
    _id?: string;
    nom: string;
    info?: string;
    photo?: string;
    sousTypeProduit: string | SousTypeProduit;
    boutique: string | Boutique;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProduitDetail {
  _id: string;
  nom: string;
  info?: string;
  photo?: string;
  boutique: { _id: string; nom: string };
  sousTypeProduit: {
    _id: string;
    nom: string;
    typeProduit: {
      _id: string;
      nom: string;
    };
  };
}

