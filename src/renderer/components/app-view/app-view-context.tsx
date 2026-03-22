import React, { createContext, useState } from 'react'

type View = 'connections' | 'viewer';

const AppViewContext = createContext<{
    view: View;
    setView: (view: View) => void;
}>({
    view: 'connections',
    setView: () => { },
});

export const useAppView = () => {
    const context = React.useContext(AppViewContext);
    if (!context) {
        throw new Error('useAppView must be used within an AppViewProvider');
    }
    return context;
};

export const AppViewProvider = ({ children }: { children: React.ReactNode }) => {
    const [view, setView] = useState<View>('connections');

    return (
        <AppViewContext.Provider value={{ view, setView }}>
            {children}
        </AppViewContext.Provider>
    )
}

export default AppViewProvider