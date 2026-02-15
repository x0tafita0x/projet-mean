import { Produit } from "../../produit/models/produit.models";

export interface StockInsert {
  _id?: string;
  produit: string | Produit;
  in: string;
  out: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface StockList {
  _id?: string;
  produit: {
    nom: string;
    sousTypeProduit: {
      nom: string;
    };
  },
  in: string;
  out: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface StockResponse {
  _id?: string;
  produit: string ;
  prixUnitaire: string;
  stockRestant: number;
  info: string;
  photo: string;
  sousTypeProduit: string;
  boutique: string;
  typeProduit: string;
}