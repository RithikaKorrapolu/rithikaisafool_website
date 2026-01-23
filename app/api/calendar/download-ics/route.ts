import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'rkrox24@gmail.com',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'Penny',
    });

    const events = response.data.items;

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No upcoming Penny events found' }, { status: 404 });
    }

    const nextEvent = events.find(event =>
      event.summary?.toLowerCase().includes('penny')
    ) || events[0];

    const startDate = nextEvent.start?.dateTime || nextEvent.start?.date;
    const endDate = nextEvent.end?.dateTime || nextEvent.end?.date;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Event has no date' }, { status: 400 });
    }

    // Format dates for ICS file
    const formatICSDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rithika is a Fool//NONSGML Event//EN
BEGIN:VEVENT
UID:${nextEvent.id}@rithikaisafool.com
DTSTAMP:${formatICSDate(new Date().toISOString())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${nextEvent.summary || 'Penny for Your Thoughts'}
DESCRIPTION:${nextEvent.description || 'Open mic to riff on new ideas and bits and art and such. Everyone gets a penny. Come through.'}
LOCATION:${nextEvent.location || 'TBD'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="penny-for-your-thoughts.ics"',
      },
    });
  } catch (error) {
    console.error('Error generating ICS file:', error);
    return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 });
  }
}
