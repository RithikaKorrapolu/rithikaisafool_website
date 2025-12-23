"use client";

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Toolbar Component
const CustomToolbar = (toolbar: any) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Month and Year - Top Left */}
      <div className="text-lg font-bold text-black">
        {format(toolbar.date, 'MMMM, yyyy')}
      </div>

      {/* View Buttons - Top Right */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => toolbar.onView('month')}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            toolbar.view === 'month'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => toolbar.onView('week')}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            toolbar.view === 'week'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => toolbar.onView('day')}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            toolbar.view === 'day'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Day
        </button>
      </div>
    </div>
  );
};

// Custom Header Component for days
const CustomHeader = ({ date, label }: { date: Date; label: string }) => {
  const dayName = format(date, 'EEE');

  return (
    <div className="flex items-center justify-center py-2 px-1 bg-gray-100 text-black rounded-lg h-12">
      <div className="text-xs font-semibold uppercase">{dayName}</div>
    </div>
  );
};

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

const sampleEvents: CalendarEvent[] = [
  {
    title: 'Booking tool app',
    start: new Date(2023, 11, 17, 9, 0),
    end: new Date(2023, 11, 17, 10, 30),
    color: '#A8C5FF',
    description: 'Working on the booking tool application'
  },
  {
    title: 'Design onboarding',
    start: new Date(2023, 11, 17, 9, 0),
    end: new Date(2023, 11, 17, 10, 30),
    color: '#B4E7CE',
    description: 'Onboarding session for new design team members'
  },
  {
    title: 'Development meet',
    start: new Date(2023, 11, 17, 10, 0),
    end: new Date(2023, 11, 17, 12, 0),
    color: '#E0BBFF',
    description: 'Weekly development team meeting'
  },
  {
    title: 'Design session',
    start: new Date(2023, 11, 18, 11, 0),
    end: new Date(2023, 11, 18, 13, 30),
    color: '#FFE5B4',
    description: 'Collaborative design session'
  },
  {
    title: 'Meet with Jonson Rider',
    start: new Date(2023, 11, 19, 10, 0),
    end: new Date(2023, 11, 19, 12, 30),
    color: '#E8E8FF',
    description: 'Client meeting at Park Lane Office'
  },
  {
    title: 'Planning tasks',
    start: new Date(2023, 11, 20, 10, 50),
    end: new Date(2023, 11, 20, 12, 30),
    color: '#E8F5E9',
    description: 'Planning upcoming tasks'
  },
  {
    title: 'Design our website',
    start: new Date(2023, 11, 21, 12, 30),
    end: new Date(2023, 11, 21, 14, 50),
    color: '#F8BBD0',
    description: 'Website redesign session'
  },
];

export default function CommunityCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.color || '#3174ad',
      borderRadius: '12px',
      opacity: 0.9,
      color: '#000',
      border: 'none',
      display: 'block',
      padding: '8px',
      fontSize: '13px',
      fontWeight: '600',
    };
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-lg p-6" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={sampleEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          defaultView="week"
          views={['month', 'week', 'day']}
          step={60}
          timeslots={1}
          min={new Date(0, 0, 0, 9, 0, 0)}
          max={new Date(0, 0, 0, 17, 0, 0)}
          showMultiDayTimes
          components={{
            toolbar: CustomToolbar,
          }}
          formats={{
            timeGutterFormat: 'h a',
          }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-black">{selectedEvent.title}</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">
                  {format(selectedEvent.start, 'EEEE, d MMMM')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">
                  {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                </span>
              </div>

              {selectedEvent.description && (
                <p className="text-gray-600 mt-4">{selectedEvent.description}</p>
              )}

              <button className="w-full mt-6 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
