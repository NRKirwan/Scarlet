import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityApplicationForm({ onSubmit, onCancel, county }) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    organisation_level: '',
    preferred_area: '',
    skills_experience: '',
    motivation: '',
    availability: '',
    emergency_contact: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              <UserCheck className="w-6 h-6 text-green-600" />
              Volunteer with {county} Local Government
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="applicant_name">Full Name</Label>
              <Input
                id="applicant_name"
                value={formData.applicant_name}
                onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="applicant_email">Email Address</Label>
              <Input
                id="applicant_email"
                type="email"
                value={formData.applicant_email}
                onChange={(e) => handleInputChange('applicant_email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="organisation_level">Level of Government</Label>
              <Select value={formData.organisation_level} onValueChange={(value) => handleInputChange('organisation_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level you'd like to volunteer with" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="county_council">County Council</SelectItem>
                  <SelectItem value="district_council">District Council</SelectItem>
                  <SelectItem value="parish_council">Parish Council</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferred_area">Preferred Area of Work</Label>
              <Input
                id="preferred_area"
                value={formData.preferred_area}
                onChange={(e) => handleInputChange('preferred_area', e.target.value)}
                placeholder="e.g., Community events, Planning, Environmental issues"
                required
              />
            </div>

            <div>
              <Label htmlFor="motivation">Why do you want to volunteer with local government?</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                placeholder="Explain your motivation for volunteering..."
                required
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor="skills_experience">Relevant Skills and Experience</Label>
              <Textarea
                id="skills_experience"
                value={formData.skills_experience}
                onChange={(e) => handleInputChange('skills_experience', e.target.value)}
                placeholder="Describe any relevant skills or experience..."
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="e.g., Weekends, weekday evenings"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact Information</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                placeholder="Name and phone number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}