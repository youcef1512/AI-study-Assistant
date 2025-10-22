
import React from 'react';
import { Section, LessonContent } from '../types';
import { BookOpenIcon, SparklesIcon, VolumeUpIcon, DownloadIcon, CalendarIcon, PlayIcon, PauseIcon } from './Icons';
import { Spinner } from './Spinner';


const CognitiveLoadIndicator: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;

    let level, text, bgColor, textColor;
    if (count <= 3) {
        level = 'Low'; text = 'Optimal for deep learning'; bgColor = 'bg-green-100'; textColor = 'text-green-800';
    } else if (count <= 5) {
        level = 'Medium'; text = 'Good balance of breadth & depth'; bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800';
    } else if (count <= 7) {
        level = 'High'; text = 'Challenging but manageable'; bgColor = 'bg-orange-100'; textColor = 'text-orange-800';
    } else {
        level = 'Very High'; text = 'Consider breaking into multiple sessions'; bgColor = 'bg-red-100'; textColor = 'text-red-800';
    }

    return (
        <div className={`p-3 rounded-lg ${bgColor} ${textColor} text-sm`}>
            <p><strong>📊 Cognitive Load: {level}</strong> ({count} sections)</p>
            <p className="mt-1">{text}</p>
        </div>
    );
};


interface SectionsCardProps {
    sections: Section[];
    isLoadingSections: boolean;
    sectionsError: string | null;
    selectedSections: Section[];
    handleToggleSection: (section: Section) => void;
    isGenerating: boolean;
    handleGenerateLesson: () => void;
    lesson: LessonContent | null;
    isSpeechSupported: boolean;
    isSpeaking: boolean;
    handleReadAloud: () => void;
    handleDownload: () => void;
    handleAddToCalendar: () => void;
}

export const SectionsCard: React.FC<SectionsCardProps> = ({
    sections, isLoadingSections, sectionsError, selectedSections, handleToggleSection, isGenerating, handleGenerateLesson, lesson, isSpeechSupported, isSpeaking, handleReadAloud, handleDownload, handleAddToCalendar
}) => {
    const hasSelection = selectedSections.length > 0;
    
    return (
         <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-3">
                <BookOpenIcon className="w-7 h-7" />
                Select Sections
            </h2>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 p-4 rounded-r-lg mb-4 text-sm">
                <strong>🧠 Cognitive Science Tip:</strong> Research shows optimal learning occurs with 3-7 chunks of information. Select sections that build on each other progressively.
            </div>

            <CognitiveLoadIndicator count={selectedSections.length} />

            <div className="mt-4 min-h-[200px] max-h-[300px] overflow-y-auto pr-2 -mr-2">
                {isLoadingSections && <div className="text-center p-4 text-gray-500">Loading sections...</div>}
                {sectionsError && <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{sectionsError}</div>}
                {!isLoadingSections && sections.length === 0 && !sectionsError && <div className="text-center p-4 text-gray-500">Select a page to see available sections.</div>}
                <div className="space-y-2">
                    {sections.map(section => (
                        <label key={section.index} htmlFor={`sec-${section.index}`} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedSections.some(s => s.index === section.index) ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'}`}>
                            <input type="checkbox" id={`sec-${section.index}`} checked={selectedSections.some(s => s.index === section.index)} onChange={() => handleToggleSection(section)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="flex-1 text-gray-800">{section.line}</span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">Lvl {section.toclevel}</span>
                        </label>
                    ))}
                </div>
            </div>

             <div className="mt-5 border-t pt-5">
                 <button onClick={handleGenerateLesson} disabled={!hasSelection || isGenerating} className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-purple-300 disabled:cursor-not-allowed mb-3">
                     {isGenerating ? <><Spinner /> Generating...</> : <><SparklesIcon className="w-5 h-5" /> Generate Lesson</>}
                 </button>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {isSpeechSupported && (
                        <button onClick={handleReadAloud} disabled={!lesson || isGenerating} className="flex justify-center items-center gap-2 bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                           {isSpeaking ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>} {isSpeaking ? 'Stop' : 'Read'}
                        </button>
                    )}
                     <button onClick={handleDownload} disabled={!lesson || isGenerating} className="flex justify-center items-center gap-2 bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                         <DownloadIcon className="w-5 h-5"/> Download
                     </button>
                     <button onClick={handleAddToCalendar} disabled={!lesson || isGenerating} className="flex justify-center items-center gap-2 bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                         <CalendarIcon className="w-5 h-5"/> Calendar
                     </button>
                 </div>
            </div>

        </div>
    );
};
