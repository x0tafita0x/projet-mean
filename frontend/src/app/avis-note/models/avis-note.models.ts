export interface AvisNote {
    _id?: string;
    utilisateur: string;
    boutique: string;
    note: number;
    avis?: string;
}

export interface AvisNoteList {
    _id: string;
    utilisateur: {
        _id: string;
        nom: string;
    };
    boutique: {
        _id: string;
        nom: string;
    };
    note: number;
    avis?: string;
}

export interface AvisNoteStats {
    averageNote: number;
    totalAvis: number;
}