export interface Category {
    id: string;
    name: string;
    _count?: { products: number };
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: number;
    costPrice: number | null;
    quantity: number;
    lowStockThreshold: number;
    imageUrl: string | null;
    categoryId: string | null;
    category: Category | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}