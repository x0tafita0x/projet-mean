export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface FilterCriteria {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: string;
    boutiqueId?: string;
    nom?: string;
    boutique?: string;
    typeProduit?: string;
    sousTypeProduit?: string;
    typeBoutique?: string;
    nbJoursOuverture?: string;
    order?: string;
    prixMin?: string | number;
    prixMax?: string | number;
    sousTypeProduitId?: string;
    typeProduitId?: string;
    typeBoutiqueId?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: any;
}
