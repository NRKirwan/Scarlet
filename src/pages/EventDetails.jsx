
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Event } from '@/api/entities';
import { EventAttendance } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Heart, Book, Bell, Clock, UserCheck, Info, Loader2, Shield, Copy, Trash, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import AddToCalendar from '@/components/events/AddToCalendar';
import CreateEventForm from '@/components/events/CreateEventForm'; // Import the form for editing

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const categoryInfo = {
  community_service: { icon: Users, color: "bg-blue-100 text-blue-800" },
  medical_outreach: { icon: Heart, color: "bg-pink-100 text-pink-800" },
  cultural_heritage: { icon: Book, color: "bg-amber-100 text-amber-800" },
  networking: { icon: Users, color: "bg-green-100 text-green-800" },
  emergency_response: { icon: Bell, color: "bg-purple-100 text-purple-800" }
};

export default function EventDetails() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [userRsvp, setUserRsvp] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const navigate = useNavigate(); // New hook for navigation

  const loadEventData = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true); // Set loading true before fetch
      const eventData = await Event.get(eventId);
      setEvent(eventData);

      const [currentUser, attendees] = await Promise.all([
        User.me().catch(() => null), // Catch error if user not logged in
        EventAttendance.filter({ eventId: eventId })
      ]);
      
      setUser(currentUser);
      setAttendeeCount(attendees.filter(a => a.status === 'attending').length);
      
      if (currentUser) {
        const rsvp = attendees.find(a => a.userId === currentUser.id);
        setUserRsvp(rsvp || null);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      setEvent(null); // Set event to null to trigger "not found"
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);
  
  const handleRsvp = async () => {
    if (!user) {
      alert("Please log in to RSVP for events.");
      return;
    }
    setIsRsvping(true);
    try {
      if (userRsvp) {
        // Cancel RSVP
        await EventAttendance.delete(userRsvp.id);
        setUserRsvp(null);
        setAttendeeCount(prev => prev - 1);
      } else {
        // Create RSVP
        const newRsvp = await EventAttendance.create({
          eventId: event.id,
          eventTitle: event.title,
          userId: user.id,
          userEmail: user.email,
          status: 'attending'
        });
        setUserRsvp(newRsvp);
        setAttendeeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
      alert("Failed to update RSVP status.");
    }
    setIsRsvping(false);
  };

  const handleUpdate = async (updatedData) => {
    if (!event) return;
    try {
      await Event.update(event.id, updatedData);
      setIsEditing(false); // Exit edit mode
      await loadEventData(); // Reload event data
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to update event.");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await Event.delete(event.id);
        alert("Event deleted successfully.");
        navigate(createPageUrl("Events")); // Navigate to events list after deletion
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event.");
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return <div className="p-8 text-center flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-red-600" /></div>;
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="text-slate-600 mb-6">The event you are looking for does not exist.</p>
        <Link to={createPageUrl("Events")}>
          <Button className="bg-red-600 hover:bg-red-700">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const position = event.latitude && event.longitude ? [event.latitude, event.longitude] : null;
  const EventIcon = categoryInfo[event.category]?.icon || Calendar;
  const iconColor = categoryInfo[event.category]?.color || "bg-gray-100 text-gray-800";
  // Determine if the current user can modify the event
  // Assuming 'created_by' field on event stores the creator's email or ID,
  // and 'user.role' is available for admin check.
  const canModify = user && (user.role === 'admin' || user.email === event.created_by);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
      {isEditing ? (
        <CreateEventForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          eventToEdit={event}
          county={event.county} // Pass event.county if needed by CreateEventForm
        />
      ) : (
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200 p-6">
                  <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                          <Link to={createPageUrl("Events")} className="text-sm text-red-600 hover:underline mb-2 inline-block">&larr; Back to Events</Link>
                          <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900">{event.title}</CardTitle>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 mt-2">
                              <Badge className={`${iconColor} self-start capitalize`} variant="secondary">
                                  <EventIcon className="w-4 h-4 mr-2" />
                                  {event.category.replace('_', ' ')}
                              </Badge>
                              <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-red-600" />
                                  <span className="font-medium">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-red-600" />
                                  <span className="font-medium">{format(new Date(event.date), "h:mm a")}</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                              <Copy className="w-4 h-4" />
                          </Button>
                          {canModify && (
                              <>
                                  <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} title="Edit">
                                      <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete">
                                      <Trash className="w-4 h-4" />
                                  </Button>
                              </>
                          )}
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2">Event Details</h3>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>
                    
                    {event.requirements && (
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2"><Info className="w-5 h-5"/>Requirements</h3>
                        <p className="text-slate-700">{event.requirements}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                      <Button onClick={handleRsvp} disabled={isRsvping || !user} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                        {isRsvping ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                        {userRsvp ? 'Cancel RSVP' : 'RSVP Now'}
                      </Button>
                      <AddToCalendar event={event} />
                    </div>
                     {!user && <p className="text-sm text-slate-500">Please <a href="#" onClick={() => User.login()} className="underline font-medium">log in</a> to RSVP.</p>}
                  </div>

                  <div className="md:col-span-1 space-y-6">
                    <Card className="bg-slate-50 border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-slate-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Location</p>
                            <p className="text-slate-600">{event.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-slate-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Attendees</p>
                            <p className="text-slate-600">{attendeeCount} / {event.attendees_limit || 'Unlimited'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <UserCheck className="w-5 h-5 text-slate-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Organizer</p>
                            <p className="text-slate-600">{event.organizer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {position && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin className="w-6 h-6 text-red-600" /> Event Location</h3>
                    <div className="h-96 rounded-lg overflow-hidden shadow-md border border-slate-200">
                        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={position}>
                            <Popup>{event.title}</Popup>
                          </Marker>
                        </MapContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
