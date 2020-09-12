import { createContext } from 'react';

const acField: { [key: string]: any } = {
    acField: 'title',
    setAcField: () => { },
};
export const acFieldContext = createContext(acField);

const searFields: { [key: string]: any } = {
    searFields: {
        title: true,
        desc: false,
        ingredstr: false,
        allerg: false,
        piccode: false,
        fuzzy: true,
    },
    setSearFields: () => { },
};
export const searFieldsContext = createContext(searFields);
