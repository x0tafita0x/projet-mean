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
    boutique: string;
    createdAt?: string;
    updatedAt?: string;
}
