export interface avisNote {
    _id?: string;
    utilisateur: string;
    boutique: string;
    note: number;
    avis?: string;
}

export interface avisNoteList {
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

export interface avisNoteStats {
    averageNote: number;
    totalAvis: number;
}