export interface Achat {
    _id?: string;
    client: string;
    total: number;
    nombreItems: number;
    etat:{
        _id: string;
        nom: string;
    }
    createdAt?: string;
    updatedAt?: string;
}

export interface AchatDetails {
    _id?: string;
    panier: {
        _id: string;
         produit: {
        _id: string;
        nom: string;
        boutique: {
            _id: string;
            nom: string;
        };
    }
    }
   ,
    prix: number;
    quantite: number;
}