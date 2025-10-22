
const toISOStringWithUTC = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateICS = (topic: string): string => {
    const now = new Date();
    const events = [
        { days: 1, title: 'Review 1' },
        { days: 3, title: 'Review 2' },
        { days: 7, title: 'Review 3' }
    ];

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AI-Lesson-Generator//EN'
    ];

    events.forEach(event => {
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() + event.days);
        eventDate.setHours(10, 0, 0, 0); // Set to 10 AM local time

        const startDateStr = toISOStringWithUTC(eventDate);
        const endDate = new Date(eventDate.getTime() + 30 * 60000); // 30 min duration
        const endDateStr = toISOStringWithUTC(endDate);

        icsContent.push(
            'BEGIN:VEVENT',
            `DTSTART:${startDateStr}`,
            `DTEND:${endDateStr}`,
            `SUMMARY:${event.title}: ${topic}`,
            `DESCRIPTION:Spaced repetition review for optimal retention. Review your notes on: ${topic}`,
            `BEGIN:VALARM`,
            'TRIGGER:-PT15M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Review reminder',
            'END:VALARM',
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\n');
};
