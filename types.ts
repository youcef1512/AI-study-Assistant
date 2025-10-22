
export interface SearchResult {
    pageid: number;
    title: string;
    snippet: string;
}

export interface Section {
    toclevel: number;
    level: string;
    line: string;
    number: string;
    index: string;
    fromtitle: string;
    byteoffset: number;
    anchor: string;
}

export interface Page {
    src: 'wikipedia' | 'wikibooks';
    pageid: number;
    title: string;
    url: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface LessonContent {
    title: string;
    introduction: string;
    coreConcepts: { concept: string; explanation: string }[];
    keyFormulas: { formula: string; description: string }[];
    workedExample: { problem: string; solution: string };
    activeRecallPrompts: string[];
}
