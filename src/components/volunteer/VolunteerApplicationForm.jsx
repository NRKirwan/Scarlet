import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function VolunteerApplicationForm({ service, onSubmit, onCancel, county }) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    skills: '',
    availability: '',
    motivation: '',
    previous_experience: '',
    references: ''
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
              <Heart className="w-6 h-6 text-pink-600" />
              Apply to Volunteer: {service.name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold mb-2">Service Details:</h4>
            <p className="text-sm text-slate-600 mb-2">{service.description}</p>
            <p className="text-sm"><strong>Location:</strong> {service.location}</p>
            <p className="text-sm"><strong>Coordinator:</strong> {service.coordinator}</p>
          </div>

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
              <Label htmlFor="motivation">Why do you want to volunteer for this service?</Label>
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
              <Label htmlFor="skills">Relevant Skills and Qualifications</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="Describe any relevant skills or qualifications..."
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="availability">Your Availability</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="e.g., Weekends, Wednesday evenings"
              />
            </div>

            <div>
              <Label htmlFor="previous_experience">Previous Volunteer Experience</Label>
              <Textarea
                id="previous_experience"
                value={formData.previous_experience}
                onChange={(e) => handleInputChange('previous_experience', e.target.value)}
                placeholder="Describe any previous volunteer work..."
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="references">References</Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="Provide contact details for references..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}