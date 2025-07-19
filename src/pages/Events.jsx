
import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, Search, Shield, Users, Heart, Book, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import CreateEventForm from "../components/events/CreateEventForm";

export default function EventsPage() {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const county = JSON.parse(localStorage.getItem('selectedCounty') || 'null');
    setSelectedCounty(county);
    if (county) {
      loadEvents(county.name);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadEvents = async (countyName) => {
    try {
      const data = await Event.filter({ county: countyName }, '-date');
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setIsLoading(false);
  };
  
  const handleCreateEvent = async (eventData) => {
    try {
      await Event.create(eventData);
      setShowCreateForm(false);
      loadEvents(selectedCounty.name);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ["all", "community_service", "medical_outreach", "cultural_heritage", "networking", "emergency_response"];
  
  const categoryInfo = {
    community_service: { icon: Users, color: "bg-blue-100 text-blue-800 border-blue-200" },
    medical_outreach: { icon: Heart, color: "bg-pink-100 text-pink-800 border-pink-200" },
    cultural_heritage: { icon: Book, color: "bg-amber-100 text-amber-800 border-amber-200" },
    networking: { icon: Users, color: "bg-green-100 text-green-800 border-green-200" },
    emergency_response: { icon: Bell, color: "bg-purple-100 text-purple-800 border-purple-200" }
  };
  
  if (!selectedCounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-8">
        <Card className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-4">No County Selected</h2>
          <p className="text-slate-600 mb-6">Select a county to view its community events.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-red-600 hover:bg-red-700">Select County</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Community Events
                </h1>
                <p className="text-lg text-slate-600">{selectedCounty.name}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />Create Event
            </Button>
          </div>
        </motion.div>

        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-base"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categoryOptions.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className={`transition-all duration-200 text-sm capitalize ${selectedCategory === cat ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                  >
                    {cat.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence>
              {isLoading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => {
                    const info = categoryInfo[event.category] || {};
                    const Icon = info.icon || Calendar;
                    return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="block h-full">
                        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <Badge className={`${info.color} self-start capitalize mb-2`} variant="secondary">{event.category.replace('_', ' ')}</Badge>
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <p className="text-slate-600 mb-4 line-clamp-3">{event.description}</p>
                            <div className="text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-slate-500" />
                                <span className="font-medium">{format(new Date(event.date), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )})}
                </div>
              )}
              {!isLoading && filteredEvents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>No events found for the selected criteria.</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {showCreateForm && (
          <CreateEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
            county={selectedCounty.name}
          />
        )}
      </div>
    </div>
  );
}
