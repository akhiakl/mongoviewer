import type { DocumentsQuery } from '../../mongo-types';

export function requireNonEmptyString(value: string | undefined | null, errorMessage: string) {
    const normalizedValue = value?.trim();
    if (!normalizedValue) {
        throw new Error(errorMessage);
    }

    return normalizedValue;
}

export function validateDocumentsQuery(query: DocumentsQuery) {
    requireNonEmptyString(query?.db, 'Database and collection are required.');
    requireNonEmptyString(query?.collection, 'Database and collection are required.');

    if (query.sortField !== undefined) {
        requireNonEmptyString(query.sortField, 'Sort field must be a non-empty string.');
    }

    if (query.sortDirection && query.sortDirection !== 'asc' && query.sortDirection !== 'desc') {
        throw new Error('Sort direction must be asc or desc.');
    }
}
