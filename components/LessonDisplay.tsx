
import React from 'react';
import { LessonContent } from '../types';
import { Spinner } from './Spinner';
import { ExternalLinkIcon } from './Icons';

interface LessonDisplayProps {
    isGenerating: boolean;
    lessonError: string | null;
    lesson: LessonContent | null;
    pageUrl: string | undefined;
    lessonRef: React.RefObject<HTMLDivElement>;
}

export const LessonDisplay: React.FC<LessonDisplayProps> = ({ isGenerating, lessonError, lesson, pageUrl, lessonRef }) => {
    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">📖 Your Personalized Lesson</h2>

            {isGenerating && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-600">
                    <Spinner size="lg" />
                    <p className="mt-4 text-lg">Generating your scientifically-optimized lesson...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            )}

            {lessonError && (
                <div className="min-h-[200px] flex items-center justify-center">
                  <div className="text-red-700 bg-red-100 p-4 rounded-lg w-full text-center">
                    <h3 className="font-bold">Lesson Generation Failed</h3>
                    <p>{lessonError}</p>
                  </div>
                </div>
            )}
            
            {lesson && (
                 <div ref={lessonRef} className="prose prose-indigo max-w-none prose-h3:text-indigo-600 prose-h3:font-semibold prose-li:my-1">
                    <h2 className="text-3xl font-bold !text-gray-900 !mb-2">{lesson.title}</h2>
                    <p className="text-sm text-gray-500 !mt-0">
                        Source: <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{pageUrl} <ExternalLinkIcon className="w-4 h-4" /></a>
                    </p>
                     
                    <div className="my-6 bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded-r-lg">
                      <strong>🧠 Learning Strategy:</strong> This lesson uses interleaving (mixing concepts) and elaboration (deep processing) to enhance retention and understanding.
                    </div>

                    <h3>📘 Introduction</h3>
                    <p>{lesson.introduction}</p>

                    <h3>🎯 Core Concepts</h3>
                    <ul>
                        {lesson.coreConcepts.map((item, index) => (
                            <li key={index}><strong>{item.concept}:</strong> {item.explanation}</li>
                        ))}
                    </ul>

                    {lesson.keyFormulas.length > 0 && (
                        <>
                          <h3>📐 Key Formulas</h3>
                          {lesson.keyFormulas.map((item, index) => (
                              <div key={index} className="my-4">
                                  <p><strong>{item.description}:</strong></p>
                                  <p className="text-lg font-mono bg-gray-100 p-3 rounded-md overflow-x-auto">
                                      $${item.formula}$$
                                  </p>
                              </div>
                          ))}
                        </>
                    )}

                    <h3>💡 Worked Example</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <p><strong>Problem:</strong> {lesson.workedExample.problem}</p>
                        <p><strong>Solution:</strong> {lesson.workedExample.solution}</p>
                    </div>

                    <h3>🔄 Active Recall Practice</h3>
                     <ol>
                        {lesson.activeRecallPrompts.map((prompt, index) => (
                           <li key={index}>{prompt}</li>
                        ))}
                    </ol>
                    
                    <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg">
                        <strong>⏰ Spaced Repetition:</strong> Review this material in 1 day, 3 days, then 7 days for optimal long-term retention. Use the "Add to Calendar" button to set reminders!
                    </div>

                </div>
            )}
        </div>
    );
};
