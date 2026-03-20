import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the same service account credentials as Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch upcoming events from the calendar (get more to filter for Penny events)
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'rithika@rithikaisafool.com',
      timeMin: new Date().toISOString(),
      maxResults: 50, // Get more events to search through
      singleEvents: true,
      orderBy: 'startTime',
      q: 'Penny', // Search for events containing "Penny"
    });

    const events = response.data.items;

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No upcoming Penny for Your Thoughts events found' }, { status: 404 });
    }

    // Find the first event with "Penny" in the title
    const nextEvent = events.find(event =>
      event.summary?.toLowerCase().includes('penny')
    ) || events[0];
    const startDate = nextEvent.start?.dateTime || nextEvent.start?.date;

    if (!startDate) {
      return NextResponse.json({ error: 'Event has no start date' }, { status: 400 });
    }

    const eventDate = new Date(startDate);
    const month = eventDate.toLocaleString('en-US', { month: 'short' });
    const day = eventDate.getDate();
    const fullDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const time = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return NextResponse.json({
      month,
      day,
      fullDate,
      time,
      title: nextEvent.summary || 'Event',
      link: nextEvent.htmlLink,
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar event' }, { status: 500 });
  }
}
