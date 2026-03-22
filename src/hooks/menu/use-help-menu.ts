import { useCallback } from 'react';

export function useHelpMenu() {
    const help = useCallback(() => {
        window.open('https://github.com/your-org/mongoviewer#readme', '_blank');
    }, []);
    const reportIssue = useCallback(() => {
        window.open('https://github.com/your-org/mongoviewer/issues', '_blank');
    }, []);
    const about = useCallback(() => {
        alert('Mongo Viewer\nVersion 1.0.0');
    }, []);

    return {
        help,
        reportIssue,
        about,
    };
}