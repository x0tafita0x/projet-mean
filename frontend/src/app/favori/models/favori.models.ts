export interface Favori {
  _id?: string;
  utilisateur: string;
  produit: string;
  createdAt?: Date;
}

export interface FavoriList {
  _id?: string;
  utilisateur: {
    _id: string;
    nom: string;
  };
  produit: {
    _id: string;
    nom: string;
    photo: string;
    sousTypeProduit: {
      nom: string;
    };
    boutique: {
      nom: string;
    };
  };
  createdAt?: Date;
  }
