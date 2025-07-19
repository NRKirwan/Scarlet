import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateLocalGovernmentUnit({ onSubmit, onCancel, countyCouncils, districtCouncils, unitToEdit }) {
  const [type, setType] = useState('county_council');
  const [formData, setFormData] = useState({
    name: '',
    headquarters: '',
    council_leader: '',
    chief_executive: '',
    mayor: '',
    chairman: '',
    clerk: '',
    population_served: 0,
    district_type: 'district',
    parish_type: 'civil_parish',
    geographic_area: '',
    ward_area: '',
    meeting_schedule: '',
    precept: 0,
    website: '',
    established: '',
    council_logo: '',
    district_logo: '',
    parish_logo: '',
    county_council_id: '',
    district_council_id: '',
    key_services: [],
    key_responsibilities: [],
    local_services: []
  });

  useEffect(() => {
    if (unitToEdit) {
      setType(unitToEdit.type);
      setFormData({
        ...unitToEdit,
        key_services: unitToEdit.key_services || [],
        key_responsibilities: unitToEdit.key_responsibilities || [],
        local_services: unitToEdit.local_services || [],
        established: unitToEdit.established ? new Date(unitToEdit.established).toISOString().split('T')[0] : ''
      });
    }
  }, [unitToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(unitToEdit ? { ...formData, type, id: unitToEdit.id } : { ...formData, type });
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
              {unitToEdit ? <Edit className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
              {unitToEdit ? `Edit ${unitToEdit.type.replace('_', ' ').charAt(0).toUpperCase() + unitToEdit.type.replace('_', ' ').slice(1)}` : 'Create New Council'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Label>Council Type</Label>
            <Select value={type} onValueChange={setType} disabled={!!unitToEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="county_council">County Council</SelectItem>
                <SelectItem value="district_council">District Council</SelectItem>
                <SelectItem value="parish_council">Parish Council</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hierarchy Selection */}
            {type === 'district_council' && (
              <div>
                <Label htmlFor="county_council_id">Parent County Council</Label>
                <Select
                  value={formData.county_council_id}
                  onValueChange={(value) => handleInputChange('county_council_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select county council" />
                  </SelectTrigger>
                  <SelectContent>
                    {countyCouncils && countyCouncils.map(council => (
                      <SelectItem key={council.id} value={council.id}>{council.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === 'parish_council' && (
              <div>
                <Label htmlFor="district_council_id">Parent District Council</Label>
                <Select
                  value={formData.district_council_id}
                  onValueChange={(value) => handleInputChange('district_council_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district council" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtCouncils && districtCouncils.map(council => (
                      <SelectItem key={council.id} value={council.id}>{council.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <Label htmlFor="name">Council Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`e.g., ${type === 'county_council' ? 'Bedfordshire County Council' : type === 'district_council' ? 'Bedford Borough Council' : 'Great Barford Parish Council'}`}
                required
              />
            </div>

            <div>
              <Label htmlFor="headquarters">Headquarters/Meeting Location</Label>
              <Input
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => handleInputChange('headquarters', e.target.value)}
                placeholder="e.g., County Hall, Bedford"
                required
              />
            </div>

            {/* Type-specific fields */}
            {type === 'district_council' && (
              <>
                <div>
                  <Label htmlFor="district_type">District Type</Label>
                  <Select value={formData.district_type} onValueChange={(value) => handleInputChange('district_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="district">District Council</SelectItem>
                      <SelectItem value="borough">Borough Council</SelectItem>
                      <SelectItem value="city">City Council</SelectItem>
                      <SelectItem value="metropolitan_borough">Metropolitan Borough</SelectItem>
                      <SelectItem value="unitary_authority">Unitary Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="geographic_area">Geographic Area</Label>
                  <Input
                    id="geographic_area"
                    value={formData.geographic_area}
                    onChange={(e) => handleInputChange('geographic_area', e.target.value)}
                    placeholder="e.g., Bedford Borough"
                    required
                  />
                </div>
              </>
            )}

            {type === 'parish_council' && (
              <>
                <div>
                  <Label htmlFor="parish_type">Parish Type</Label>
                  <Select value={formData.parish_type} onValueChange={(value) => handleInputChange('parish_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civil_parish">Civil Parish</SelectItem>
                      <SelectItem value="town_council">Town Council</SelectItem>
                      <SelectItem value="community_council">Community Council</SelectItem>
                      <SelectItem value="neighbourhood_council">Neighbourhood Council</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ward_area">Ward/Parish Area</Label>
                  <Input
                    id="ward_area"
                    value={formData.ward_area}
                    onChange={(e) => handleInputChange('ward_area', e.target.value)}
                    placeholder="e.g., Great Barford Parish"
                    required
                  />
                </div>
              </>
            )}

            {/* Leadership */}
            <div>
              <Label htmlFor="council_leader">
                {type === 'parish_council' ? 'Chairman' : 'Council Leader'}
              </Label>
              <Input
                id="council_leader"
                value={type === 'parish_council' ? formData.chairman : formData.council_leader}
                onChange={(e) => handleInputChange(type === 'parish_council' ? 'chairman' : 'council_leader', e.target.value)}
                placeholder={`e.g., ${type === 'parish_council' ? 'Cllr John Smith' : 'Cllr Jane Doe (Conservative)'}`}
              />
            </div>

            {type === 'county_council' && (
              <div>
                <Label htmlFor="chief_executive">Chief Executive</Label>
                <Input
                  id="chief_executive"
                  value={formData.chief_executive}
                  onChange={(e) => handleInputChange('chief_executive', e.target.value)}
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
            )}

            {type === 'district_council' && (
              <div>
                <Label htmlFor="mayor">Mayor (if applicable)</Label>
                <Input
                  id="mayor"
                  value={formData.mayor}
                  onChange={(e) => handleInputChange('mayor', e.target.value)}
                  placeholder="e.g., Cllr David Brown"
                />
              </div>
            )}

            {type === 'parish_council' && (
              <div>
                <Label htmlFor="clerk">Parish Clerk</Label>
                <Input
                  id="clerk"
                  value={formData.clerk}
                  onChange={(e) => handleInputChange('clerk', e.target.value)}
                  placeholder="e.g., Mrs. Anne Wilson"
                />
              </div>
            )}

            <div>
              <Label htmlFor="population_served">Population Served</Label>
              <Input
                id="population_served"
                type="number"
                value={formData.population_served}
                onChange={(e) => handleInputChange('population_served', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            {type === 'parish_council' && (
              <>
                <div>
                  <Label htmlFor="meeting_schedule">Meeting Schedule</Label>
                  <Input
                    id="meeting_schedule"
                    value={formData.meeting_schedule}
                    onChange={(e) => handleInputChange('meeting_schedule', e.target.value)}
                    placeholder="e.g., First Tuesday of each month"
                  />
                </div>
                <div>
                  <Label htmlFor="precept">Annual Precept (£)</Label>
                  <Input
                    id="precept"
                    type="number"
                    value={formData.precept}
                    onChange={(e) => handleInputChange('precept', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </>
            )}

            {type === 'county_council' && (
              <>
                <div>
                  <Label htmlFor="website">Official Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example-county.gov.uk"
                  />
                </div>
                <div>
                  <Label htmlFor="established">Established Date</Label>
                  <Input
                    id="established"
                    type="date"
                    value={formData.established}
                    onChange={(e) => handleInputChange('established', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {unitToEdit ? 'Save Changes' : 'Create Council'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}