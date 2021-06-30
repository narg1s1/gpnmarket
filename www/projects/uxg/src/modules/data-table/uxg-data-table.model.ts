export interface IUxgDataTableColumnHeader {
    name: string;
    alias: string;
    sortable?: boolean;
    sorted?: boolean;
    pinnable?: boolean;
    sortDirection?: 'ASC' | 'DESC';
    customStyles?: object;
    isVisible?: boolean;
    isAlwaysVisible?: boolean;
}

export interface IUxgDataTableTemplate<T> {
    data: T;
    isFirst?: boolean;
    isLast?: boolean;
}
