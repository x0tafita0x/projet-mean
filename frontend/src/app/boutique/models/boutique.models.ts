export interface TypeBoutique {
    _id?: string;
    nom: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Boutique {
    _id?: string;
    nom: string;
    typeBoutique: string | TypeBoutique;
    heureOuverture: string;
    heureFermeture: string;
    nbJoursOuverture: string;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
}