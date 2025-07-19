
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, MapPin, Loader2, Edit } from "lucide-react"; // Added Edit icon
import { motion } from "framer-motion";
import { InvokeLLM } from "@/api/integrations";

export default function CreateEventForm({ onSubmit, onCancel, county, eventToEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    location: '',
    latitude: null,
    longitude: null,
    organizer: '',
    attendees_limit: '',
    requirements: ''
  });
  
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        category: eventToEdit.category || '',
        date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().substring(0, 16) : '',
        location: eventToEdit.location || '',
        latitude: eventToEdit.latitude || null,
        longitude: eventToEdit.longitude || null,
        organizer: eventToEdit.organizer || '',
        attendees_limit: eventToEdit.attendees_limit || '',
        requirements: eventToEdit.requirements || ''
      });
    }
  }, [eventToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      county: county,
      attendees_limit: formData.attendees_limit ? parseInt(formData.attendees_limit) : null
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const lookupCoordinates = async () => {
    if (!formData.location.trim()) {
      alert("Please enter a location first");
      return;
    }

    setIsLoadingCoordinates(true);
    try {
      const response = await InvokeLLM({
        prompt: `Find the exact latitude and longitude coordinates for this location: "${formData.location}, ${county}, UK". This should be a specific place like a town hall, church, park, or street address. Return only a JSON object with "latitude" and "longitude" as decimal numbers. If the location cannot be found, return null for both values.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: ["number", "null"] },
            longitude: { type: ["number", "null"] }
          },
          required: ["latitude", "longitude"]
        }
      });

      if (response.latitude && response.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: response.latitude,
          longitude: response.longitude
        }));
      } else {
        alert("Could not find coordinates for this location. Please check the address and try again.");
      }
    } catch (error) {
      console.error("Error looking up coordinates:", error);
      alert("Error looking up coordinates. Please try again.");
    }
    setIsLoadingCoordinates(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              {eventToEdit ? <Edit className="w-6 h-6 text-red-600" /> : <Plus className="w-6 h-6 text-red-600" />}
              {eventToEdit ? 'Edit Event' : `Create New Event in ${county}`}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="e.g., St. George's Day Parade"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the event in detail..."
                required
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community_service">Community Service</SelectItem>
                  <SelectItem value="medical_outreach">Medical Outreach</SelectItem>
                  <SelectItem value="cultural_heritage">Cultural Heritage</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="emergency_response">Emergency Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date and Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Town Hall, High Street, Bedford"
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={lookupCoordinates}
                  disabled={isLoadingCoordinates}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Find coordinates for this location"
                >
                  {isLoadingCoordinates ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Coordinates found: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => handleInputChange('organizer', e.target.value)}
                placeholder="e.g., Bedford Community Council"
                required
              />
            </div>

            <div>
              <Label htmlFor="attendees_limit">Maximum Attendees (optional)</Label>
              <Input
                id="attendees_limit"
                type="number"
                value={formData.attendees_limit}
                onChange={(e) => handleInputChange('attendees_limit', e.target.value)}
                placeholder="Leave blank for unlimited"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements (optional)</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Any special requirements or items to bring..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {eventToEdit ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
