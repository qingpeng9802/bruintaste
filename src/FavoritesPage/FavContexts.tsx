import { createContext } from 'react';

const itemsPerPage: { [key: string]: any } = {
    itemsPerPage: 100,
    setItemsPerPage: () => { },
};
export const itemsPerPageContext = createContext(itemsPerPage);

const currPageRes: { [key: string]: any } = {
    currPageRes: [],
    setCurrPageRes: () => { },
};
export const currPageResContext = createContext(currPageRes);

const ifShowOverlay: { [key: string]: any } = {
    ifShowOverlay: false,
    setIfShowOverlay: () => { },
};
export const ifShowOverlayContext = createContext(ifShowOverlay);
