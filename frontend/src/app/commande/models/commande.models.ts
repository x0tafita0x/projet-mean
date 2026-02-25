export interface Commande {
    _id: string;
    client: string;
    totalPrix: number;
    totalQuantite: number;
    createdAt: Date;
}
export interface CommandeDetails {
    _id: string;
    achat : string;
    panier : {
        _id: string;
        utilisateur: string;
        produit: {
            nom: string;
            photo: string;
            boutique: {
                _id: string;
                nom: string;
            }
            sousTypeProduit: {
                _id: string;
                nom: string;
            }
        };
    };
    prix: number;
    quantite: number;
    createdAt: Date;
    }