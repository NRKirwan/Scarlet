import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarPlus } from 'lucide-react';

// Formats a date for Google Calendar and ICS links.
const formatCalendarDate = (date) => {
  return new Date(date).toISOString().replace(/-|:|\.\d{3}/g, '');
};

export default function AddToCalendar({ event }) {
  if (!event) return null;

  const startDate = formatCalendarDate(event.date);
  // Assume a 2-hour duration if no end date is specified
  const endDate = formatCalendarDate(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000));

  // Construct Google Calendar link
  const googleLink = new URL('https://www.google.com/calendar/render');
  googleLink.searchParams.append('action', 'TEMPLATE');
  googleLink.searchParams.append('text', event.title);
  googleLink.searchParams.append('dates', `${startDate}/${endDate}`);
  googleLink.searchParams.append('details', `${event.description}\n\nRequirements: ${event.requirements || 'None'}`);
  googleLink.searchParams.append('location', event.location);

  // Construct ICS file content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `URL:${window.location.href}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('%0A');

  const icsLink = `data:text/calendar;charset=utf8,${icsContent}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <a href={googleLink.toString()} target="_blank" rel="noopener noreferrer" className="w-full">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={icsLink} download={`${event.title}.ics`} className="w-full">
            iCal / Outlook
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}