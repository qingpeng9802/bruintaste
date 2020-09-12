import { createContext } from 'react';

const ifShowOverlay: { [key: string]: any } = {
    ifShowOverlay: false,
    setIfShowOverlay: () => { },
};
export const ifShowOverlayContext = createContext(ifShowOverlay);
