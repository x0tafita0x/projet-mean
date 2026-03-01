import { PaginatedResponse } from '../../shared/models/pagination.models';

export interface Annonce {
    _id?: string;
    boutique: any; // ID or Populated Object { _id: string, nom: string }
    contenu: string;
    photos: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AnnonceCreate {
    boutique: string;
    contenu: string;
    photos: File[];
}

export type AnnoncePaginatedResponse = PaginatedResponse<Annonce>;
