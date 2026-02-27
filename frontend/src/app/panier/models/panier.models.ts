export interface Panier {
    _id?: string;
    utilisateur: string;
    produit: string;
    prix: number;
    quantite: number;
    promotion?: string;
    etat: string;
    typeCommande: string;
    boutique?: string;
    dateHeureRecuperation?: string;
}


export interface PanierList {
    _id?: string;
    utilisateur: string;
    produit: {
        _id: string;
        nom: string;
        photo?: string;
        
    };
    etat: {
        _id: string;
        nom: string;
    };
    boutique: {
        _id: string;
        nom: string;
    };
    prixActuel: number;
    quantite: number;
    promotion?: string;
    typeCommande: string;
    dateHeureRecuperation?: string;
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
