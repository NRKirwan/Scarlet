
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateVolunteerServiceForm({ onSubmit, onCancel, county, serviceToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    coordinator: '',
    contact_info: '',
    location: '',
    schedule: '',
    volunteers_needed: '',
    requirements: '',
    training_provided: false
  });

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name || '',
        category: serviceToEdit.category || '',
        description: serviceToEdit.description || '',
        coordinator: serviceToEdit.coordinator || '',
        contact_info: serviceToEdit.contact_info || '',
        location: serviceToEdit.location || '',
        schedule: serviceToEdit.schedule || '',
        volunteers_needed: serviceToEdit.volunteers_needed !== undefined && serviceToEdit.volunteers_needed !== null ? String(serviceToEdit.volunteers_needed) : '',
        requirements: serviceToEdit.requirements || '',
        training_provided: serviceToEdit.training_provided || false
      });
    }
  }, [serviceToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      volunteers_needed: formData.volunteers_needed ? parseInt(formData.volunteers_needed, 10) : null
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              {serviceToEdit ? <Edit className="w-6 h-6 text-red-600" /> : <Plus className="w-6 h-6 text-red-600" />}
              {serviceToEdit ? 'Edit Volunteer Service' : `Register New Volunteer Service in ${county}`}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="e.g., Community Meals for Elderly"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="food_assistance">Food Assistance</SelectItem>
                  <SelectItem value="elderly_care">Elderly Care</SelectItem>
                  <SelectItem value="emergency_response">Emergency Response</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="community_support">Community Support</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="youth_programs">Youth Programs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the volunteer service in detail..."
                required
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor="coordinator">Service Coordinator</Label>
              <Input
                id="coordinator"
                value={formData.coordinator}
                onChange={(e) => handleInputChange('coordinator', e.target.value)}
                required
                placeholder="Your name or organization name"
              />
            </div>

            <div>
              <Label htmlFor="contact_info">Contact Information</Label>
              <Input
                id="contact_info"
                value={formData.contact_info}
                onChange={(e) => handleInputChange('contact_info', e.target.value)}
                placeholder="Phone number, email, or website"
              />
            </div>

            <div>
              <Label htmlFor="location">Location or Area</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Bedford Town Centre, Various locations"
              />
            </div>

            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                placeholder="e.g., Weekends, Monday evenings, Flexible"
              />
            </div>

            <div>
              <Label htmlFor="volunteers_needed">Number of Volunteers Needed</Label>
              <Input
                id="volunteers_needed"
                type="number"
                value={formData.volunteers_needed}
                onChange={(e) => handleInputChange('volunteers_needed', e.target.value)}
                placeholder="How many volunteers do you need?"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements or Qualifications</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Any special requirements, skills, or background checks needed..."
                className="h-20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="training_provided"
                checked={formData.training_provided}
                onCheckedChange={(checked) => handleInputChange('training_provided', checked)}
              />
              <Label htmlFor="training_provided">Training will be provided to volunteers</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {serviceToEdit ? 'Save Changes' : 'Register Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
