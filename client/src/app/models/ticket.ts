export interface Ticket {
    id: string;
    description: string;
    createdAt: string;
    images: Image[];
    position: number[];
    categories: Category[];
    category: Category;
    state: string;
    address: string;
    uid: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Image {
    recordedAt: string;
    url: string;
}

