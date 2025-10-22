
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, SparklesIcon } from './Icons';
import { Spinner } from './Spinner';

interface AiTutorProps {
    chatHistory: ChatMessage[];
    isTutorLoading: boolean;
    tutorError: string | null;
    handleTutorQuery: (query: string) => void;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(contentRef.current) {
            // A simple way to render markdown-like text with MathJax compatibility
            let html = message.content
                .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
                .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-sm rounded px-1 py-0.5">$1</code>') // Inline code
                .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-3 rounded-md overflow-x-auto text-sm my-2"><code>$1</code></pre>') // Code blocks
                .replace(/\n/g, '<br />');
                
            contentRef.current.innerHTML = html;
            if ((window as any).MathJax?.typesetPromise) {
                (window as any).MathJax.typesetPromise([contentRef.current]);
            }
        }
    }, [message.content]);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-4 rounded-2xl ${isUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <div ref={contentRef} className="prose prose-sm max-w-none"></div>
            </div>
        </div>
    );
};

export const AiTutor: React.FC<AiTutorProps> = ({ chatHistory, isTutorLoading, tutorError, handleTutorQuery }) => {
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isTutorLoading) {
            handleTutorQuery(input);
            setInput('');
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 sm:p-8 shadow-lg text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <SparklesIcon className="w-7 h-7" /> AI Study Assistant
            </h3>
            <p className="text-sm opacity-90 mb-4">
                Ask questions about your lesson! Try: "Explain this formula", "Give me practice problems", or "Test my understanding".
            </p>
            
            <div ref={chatContainerRef} className="bg-black bg-opacity-20 backdrop-blur-sm rounded-xl p-4 h-96 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                {isTutorLoading && chatHistory[chatHistory.length - 1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="max-w-xl p-4 rounded-2xl bg-gray-200 text-gray-800 flex items-center gap-2">
                           <Spinner /> Thinking...
                        </div>
                    </div>
                )}
                {tutorError && (
                    <div className="p-3 bg-red-200 text-red-800 rounded-lg text-sm">{tutorError}</div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow p-3 bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    disabled={isTutorLoading}
                />
                <button type="submit" disabled={!input.trim() || isTutorLoading} className="bg-pink-400 text-white font-semibold p-3 rounded-lg hover:bg-pink-500 transition-transform transform hover:scale-105 disabled:bg-pink-300 disabled:cursor-not-allowed flex-shrink-0">
                    <PaperAirplaneIcon className="w-6 h-6"/>
                </button>
            </form>
        </div>
    );
};
