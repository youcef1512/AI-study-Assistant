
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchResult, Section, Page, ChatMessage, LessonContent } from './types';
import { searchPages, fetchSections, fetchSectionText } from './services/wikiService';
import { generateLesson, getTutorResponseStream } from './services/geminiService';
import { generateICS } from './utils/calendar';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

import { Header } from './components/Header';
import { SearchCard } from './components/SearchCard';
import { SectionsCard } from './components/SectionsCard';
import { LessonDisplay } from './components/LessonDisplay';
import { AiTutor } from './components/AiTutor';
import { Footer } from './components/Footer';

const App: React.FC = () => {
    const [source, setSource] = useState<'wikipedia' | 'wikibooks'>('wikipedia');
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoadingSections, setIsLoadingSections] = useState<boolean>(false);
    const [sectionsError, setSectionsError] = useState<string | null>(null);

    const [selectedSections, setSelectedSections] = useState<Section[]>([]);

    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [lessonError, setLessonError] = useState<string | null>(null);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
    const [tutorError, setTutorError] = useState<string | null>(null);
    const lessonContextRef = useRef('');

    const { isSpeaking, isSupported, speak, cancel } = useSpeechSynthesis();
    const lessonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lesson && (window as any).MathJax?.typesetPromise) {
            (window as any).MathJax.typesetPromise();
        }
    }, [lesson]);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) {
            setSearchError("Please enter a topic to search.");
            return;
        }
        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        clearLessonState();
        try {
            const results = await searchPages(source, query);
            setSearchResults(results);
            if (results.length === 0) {
              setSearchError('No results found. Try another topic.');
            }
        } catch (error) {
            setSearchError(`Search failed. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSearching(false);
        }
    }, [query, source]);

    const handleSelectPage = useCallback(async (page: SearchResult) => {
        const pageDetails: Page = {
            src: source,
            pageid: page.pageid,
            title: page.title,
            url: `https://${source === 'wikipedia' ? 'en.wikipedia' : 'en.wikibooks'}.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
        };
        setSelectedPage(pageDetails);
        setIsLoadingSections(true);
        setSectionsError(null);
        setSections([]);
        setSelectedSections([]);
        clearLessonState();

        try {
            const fetchedSections = await fetchSections(source, page.pageid);
            setSections(fetchedSections);
        } catch (error) {
            setSectionsError(`Failed to load sections. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoadingSections(false);
        }
    }, [source]);

    const handleToggleSection = (section: Section) => {
        setSelectedSections(prev =>
            prev.some(s => s.index === section.index)
                ? prev.filter(s => s.index !== section.index)
                : [...prev, section].sort((a, b) => parseInt(a.index, 10) - parseInt(b.index, 10))
        );
    };

    const handleGenerateLesson = useCallback(async () => {
        if (!selectedPage || selectedSections.length === 0) return;

        setIsGenerating(true);
        setLessonError(null);
        setLesson(null);

        try {
            const sectionTexts = await Promise.all(
                selectedSections.map(s => fetchSectionText(selectedPage.src, selectedPage.pageid, s.index))
            );
            
            const snippets = selectedSections.map((section, index) => ({
                title: section.line,
                content: sectionTexts[index],
            }));

            const combinedText = snippets.map(s => `${s.title}\n${s.content}`).join('\n\n');
            lessonContextRef.current = combinedText;

            const generatedLesson = await generateLesson(selectedPage.title, snippets);
            setLesson(generatedLesson);
            setChatHistory([]);
            setTutorError(null);

        } catch (error) {
            setLessonError(`Failed to generate lesson. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedPage, selectedSections]);
    
    const handleTutorQuery = useCallback(async (userQuery: string) => {
        if (!userQuery.trim() || !lesson) return;

        setTutorError(null);
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userQuery }];
        setChatHistory(newHistory);
        setIsTutorLoading(true);

        try {
            const stream = await getTutorResponseStream(
                selectedPage?.title ?? "the topic",
                lessonContextRef.current,
                newHistory
            );

            let aiResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                aiResponse += chunk.text;
                setChatHistory(prev => {
                    const latestHistory = [...prev];
                    latestHistory[latestHistory.length - 1] = { role: 'model', content: aiResponse };
                    return latestHistory;
                });
            }
            if ((window as any).MathJax?.typesetPromise) {
                (window as any).MathJax.typesetPromise();
            }

        } catch (error) {
            const errorMessage = `AI tutor error: ${error instanceof Error ? error.message : 'Please try again.'}`;
            setTutorError(errorMessage);
            setChatHistory(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error. ${errorMessage}` }]);
        } finally {
            setIsTutorLoading(false);
        }
    }, [chatHistory, lesson, selectedPage]);
    
    const handleReadAloud = () => {
        if (isSpeaking) {
            cancel();
        } else if (lessonRef.current) {
            const lessonText = lessonRef.current.innerText;
            speak(lessonText);
        }
    };
    
    const handleDownload = () => {
        if (!lessonRef.current) return;
        const text = lessonRef.current.innerText;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${selectedPage?.title.replace(/\s/g, '_') || 'lesson'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleAddToCalendar = () => {
        if (!selectedPage) return;
        const icsContent = generateICS(selectedPage.title);
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spaced-repetition-reviews.ics';
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearSearch = () => {
        setQuery('');
        setSearchResults([]);
        setSearchError(null);
        setSelectedPage(null);
        setSections([]);
        setSelectedSections([]);
        clearLessonState();
    };
    
    const clearLessonState = () => {
        setLesson(null);
        setLessonError(null);
        setChatHistory([]);
        setTutorError(null);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen text-gray-800 font-sans p-4 sm:p-6 md:p-8">
            <div className="container mx-auto max-w-7xl">
                <Header />

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <SearchCard
                        source={source}
                        setSource={setSource}
                        query={query}
                        setQuery={setQuery}
                        handleSearch={handleSearch}
                        isSearching={isSearching}
                        clearSearch={clearSearch}
                        searchError={searchError}
                        searchResults={searchResults}
                        handleSelectPage={handleSelectPage}
                        selectedPage={selectedPage}
                    />
                    <SectionsCard
                        sections={sections}
                        isLoadingSections={isLoadingSections}
                        sectionsError={sectionsError}
                        selectedSections={selectedSections}
                        handleToggleSection={handleToggleSection}
                        isGenerating={isGenerating}
                        handleGenerateLesson={handleGenerateLesson}
                        lesson={lesson}
                        isSpeechSupported={isSupported}
                        isSpeaking={isSpeaking}
                        handleReadAloud={handleReadAloud}
                        handleDownload={handleDownload}
                        handleAddToCalendar={handleAddToCalendar}
                    />
                </main>

                {(isGenerating || lesson || lessonError) && (
                    <div className="mt-6 lg:mt-8">
                        <LessonDisplay
                            isGenerating={isGenerating}
                            lessonError={lessonError}
                            lesson={lesson}
                            pageUrl={selectedPage?.url}
                            lessonRef={lessonRef}
                        />
                    </div>
                )}
                
                {lesson && !isGenerating && !lessonError && (
                    <div className="mt-6 lg:mt-8">
                       <AiTutor
                           chatHistory={chatHistory}
                           isTutorLoading={isTutorLoading}
                           tutorError={tutorError}
                           handleTutorQuery={handleTutorQuery}
                       />
                    </div>
                )}
                
                <Footer />
            </div>
        </div>
    );
};

export default App;
