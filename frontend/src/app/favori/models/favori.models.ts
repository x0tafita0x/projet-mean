export interface Favori {
  _id?: string;
  utilisateur: string;
  boutique: string;
  createdAt?: Date;
}

export interface FavoriList {
  _id?: string;
  utilisateur: {
    _id: string;
    nom: string;
  };
  boutique: {
    _id: string;
    nom: string;
    photo: string;
    typeBoutique: {
      nom: string;
    };
  };
  createdAt?: Date;
  }
