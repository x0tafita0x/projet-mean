export interface MouvementPrixProduit {
    _id?: string;
    produit: {
        _id: string;
        nom: string;
        sousTypeProduit: {
            _id: string;
            nom: string;
        };
    };
    prix: number;
    createdAt: Date;
}

export interface MouvementPrixProduitInsert {
    produit: string;
    prix: string;
}