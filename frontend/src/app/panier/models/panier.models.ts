export interface Panier {
    _id?: string;
    utilisateur: string;
    produit: string;
    prix: number;
    quantite: number;
    promotion?: string;
    etat: string;
    typeCommande: string;
    dateHeureRecuperation?: Date;
}


export interface PanierList {
    _id?: string;
    utilisateur: string;
    produit: {
        _id: string;
        nom: string;
        photo?: string;
        boutique : {
            nom: string;
        }
    };
    etat: {
        _id: string;
        nom: string;
    };
    prixActuel: number;
    quantite: number;
    promotion?: string;
    typeCommande: string;
    dateHeureRecuperation?: Date;
    createdAt: string;
    updatedAt: string;
    edit: boolean;
    selected: boolean;
}

export interface Etat {
    _id?: string;
    nom: string;
    createdAt?: string;
    updatedAt?: string;
}
