
import React from 'react';
import { SearchResult, Page } from '../types';
import { SearchIcon, XIcon, ExternalLinkIcon } from './Icons';
import { Spinner } from './Spinner';

interface SearchCardProps {
    source: 'wikipedia' | 'wikibooks';
    setSource: (source: 'wikipedia' | 'wikibooks') => void;
    query: string;
    setQuery: (query: string) => void;
    handleSearch: () => void;
    isSearching: boolean;
    clearSearch: () => void;
    searchError: string | null;
    searchResults: SearchResult[];
    handleSelectPage: (page: SearchResult) => void;
    selectedPage: Page | null;
}

export const SearchCard: React.FC<SearchCardProps> = ({
    source, setSource, query, setQuery, handleSearch, isSearching, clearSearch, searchError, searchResults, handleSelectPage, selectedPage
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-3">
                <SearchIcon className="w-7 h-7" />
                Find Content
            </h2>

            <div>
                <label htmlFor="source" className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                <select id="source" value={source} onChange={(e) => setSource(e.target.value as 'wikipedia' | 'wikibooks')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="wikipedia">Wikipedia (Science Articles)</option>
                    <option value="wikibooks">Wikibooks (Textbooks)</option>
                </select>
            </div>

            <div className="mt-4">
                <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-2">Search Topic</label>
                <input id="query" type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} placeholder="e.g., binomial distribution" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
            </div>

            <div className="mt-4 flex gap-3">
                <button onClick={handleSearch} disabled={isSearching} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                    {isSearching ? <><Spinner /> Searching...</> : <><SearchIcon className="w-5 h-5" /> Search</>}
                </button>
                <button onClick={clearSearch} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105">
                    <XIcon className="w-5 h-5" /> Clear
                </button>
            </div>

            <div className="mt-5 min-h-[200px]">
                {searchError && <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{searchError}</div>}
                {isSearching && !searchError && <div className="text-center p-4 text-gray-500">Searching for articles...</div>}
                {!isSearching && searchResults.length === 0 && !searchError && (
                    <div className="text-center p-4 text-gray-500">Enter a topic and click search to see results.</div>
                )}
                <div className="space-y-3">
                {searchResults.map(result => (
                    <div key={result.pageid} className={`p-4 border rounded-lg transition-all duration-300 ${selectedPage?.pageid === result.pageid ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300' : 'bg-gray-50 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                        <h3 className="font-bold text-gray-800">{result.title}</h3>
                        <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: result.snippet + '...' }} />
                        <div className="mt-3 flex gap-2">
                             <button onClick={() => handleSelectPage(result)} className="text-sm bg-indigo-500 text-white font-medium py-1 px-3 rounded-md hover:bg-indigo-600 transition">
                                Select
                            </button>
                            <a href={`https://${source}.org/wiki/${result.title.replace(/ /g, '_')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-md hover:bg-gray-300 transition">
                                View <ExternalLinkIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};
