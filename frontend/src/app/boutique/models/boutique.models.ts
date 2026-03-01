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
    numeroTelephone: string;
    photo?: string;
    isOuverte?: boolean;
    createdAt?: string;
    updatedAt?: string;
    moyenneNote?: number;
    totalAvis?: number;
}

export interface BoutiqueNote {
    _id?: string;
    nom: string;
    typeBoutique: string | TypeBoutique;
    heureOuverture: string;
    heureFermeture: string;
    numeroTelephone: string;
    photo?: string;
    isOuverte?: boolean;
    createdAt?: string;
    updatedAt?: string;
    moyenneNote: number;
    totalAvis: number;
}

export interface BoutiqueDashboardStats {
    kpis: {
        produits: {
            total: number;
            actifs: number;
            rupture: number;
        };
        commandes: {
            enAttente: number;
            aRecuperer: number;
            payeeEtRecuperee: number;
            annulees: number;
        };
        financier: {
            caTotal: number;
            caMois: number;
            commission: number;
            revenusNets: number;
        };
    };
    graphiques: {
        ventes7Jours: { date: string; total: number }[];
        ventesParMois: { mois: number; total: number }[];
        topProduits: { nom: string; quantiteVendue: number; totalGenere: number }[];
    };
}