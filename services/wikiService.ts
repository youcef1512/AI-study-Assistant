
import { SearchResult, Section } from '../types';

const API_ENDPOINTS = {
    wikipedia: 'https://en.wikipedia.org/w/api.php',
    wikibooks: 'https://en.wikibooks.org/w/api.php',
};

const apiURL = (base: string, params: Record<string, string | number>) => {
    const url = new URL(base);
    url.search = new URLSearchParams({
        ...params,
        format: 'json',
        origin: '*',
    }).toString();
    return url.toString();
};

async function fetchJSON<T,>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
}

export const searchPages = async (source: 'wikipedia' | 'wikibooks', query: string): Promise<SearchResult[]> => {
    const url = apiURL(API_ENDPOINTS[source], {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: 10,
        srprop: 'snippet',
    });
    const data = await fetchJSON<{ query?: { search: SearchResult[] } }>(url);
    return data.query?.search || [];
};

export const fetchSections = async (source: 'wikipedia' | 'wikibooks', pageid: number): Promise<Section[]> => {
    const url = apiURL(API_ENDPOINTS[source], {
        action: 'parse',
        pageid: pageid,
        prop: 'sections',
        formatversion: 2,
    });
    const data = await fetchJSON<{ parse?: { sections: Section[] } }>(url);
    return data.parse?.sections || [];
};

export const fetchSectionText = async (source: 'wikipedia' | 'wikibooks', pageid: number, sectionIndex: string): Promise<string> => {
    const url = apiURL(API_ENDPOINTS[source], {
        action: 'parse',
        pageid: pageid,
        prop: 'text',
        section: sectionIndex,
        formatversion: 2,
    });
    const data = await fetchJSON<{ parse?: { text: string } }>(url);
    const html = data.parse?.text || '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove unwanted elements
    tempDiv.querySelectorAll('sup.reference, .mw-editsection, .infobox, .navbox, style, script, .thumb, .gallery, table').forEach(el => el.remove());
    
    // Basic text cleaning, trying to preserve structure
    return tempDiv.innerText.replace(/\s+/g, ' ').trim();
};
