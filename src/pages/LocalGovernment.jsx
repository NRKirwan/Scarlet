import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Event } from "@/api/entities";
import { CountyCouncil } from "@/api/entities";
import { DistrictCouncil } from "@/api/entities";
import { ParishCouncil } from "@/api/entities";
import { CommunityApplication } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Building2, UserCheck, Calendar, MapPin, Users, Scale, Landmark, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import CountyCouncilOverview from "../components/local-government/CountyCouncilOverview";
import DistrictCouncilStructure from "../components/local-government/DistrictCouncilStructure";
import ParishCouncilDetails from "../components/local-government/ParishCouncilDetails";
import CommunityVolunteers from "../components/local-government/CommunityVolunteers";
import CreateLocalGovernmentUnit from "../components/local-government/CreateLocalGovernmentUnit";
import CommunityApplicationForm from "../components/local-government/CommunityApplicationForm";

export default function LocalGovernmentPage() {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [user, setUser] = useState(null);
  const [leadership, setLeadership] = useState([]);
  const [communityVolunteers, setCommunityVolunteers] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [countyCouncils, setCountyCouncils] = useState([]);
  const [districtCouncils, setDistrictCouncils] = useState([]);
  const [parishCouncils, setParishCouncils] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const county = JSON.parse(localStorage.getItem('selectedCounty') || 'null');
    setSelectedCounty(county);
    User.me().then(setUser).catch(() => setUser(null));
    if (county) {
      loadLocalGovernmentData(county.name);
    } else {
      setIsLoading(false);
    }
  }, []);

  const naturalSort = (a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  };

  const loadLocalGovernmentData = async (countyName) => {
    try {
      const [users, events, countyData, districtData, parishData] = await Promise.all([
        User.filter({ county: countyName }),
        Event.filter({ county: countyName, category: "community_service" }, '-date'),
        CountyCouncil.filter({ county: countyName }),
        DistrictCouncil.filter({ county: countyName }),
        ParishCouncil.filter({ county: countyName })
      ]);

      setLeadership(users.filter(u => ['sheriff', 'deputy', 'lord_lieutenant'].includes(u.role)));
      setCommunityVolunteers(users.filter(u => u.role === 'citizen'));
      setLocalEvents(events);
      
      countyData.sort(naturalSort);
      districtData.sort(naturalSort);
      parishData.sort(naturalSort);

      setCountyCouncils(countyData);
      setDistrictCouncils(districtData);
      setParishCouncils(parishData);
    } catch (error) {
      console.error("Error loading local government data:", error);
    }
    setIsLoading(false);
  };

  const handleSaveUnit = async (unitData) => {
    try {
      const unitType = editingUnit ? editingUnit.type : unitData.type;
      const dataToSave = { ...unitData, county: selectedCounty.name };
      delete dataToSave.type;

      if (editingUnit) {
        if (unitType === 'county_council') await CountyCouncil.update(editingUnit.id, dataToSave);
        if (unitType === 'district_council') await DistrictCouncil.update(editingUnit.id, dataToSave);
        if (unitType === 'parish_council') await ParishCouncil.update(editingUnit.id, dataToSave);
      } else {
        if (unitType === 'county_council') await CountyCouncil.create(dataToSave);
        if (unitType === 'district_council') await DistrictCouncil.create(dataToSave);
        if (unitType === 'parish_council') await ParishCouncil.create(dataToSave);
      }
      setShowCreateForm(false);
      setEditingUnit(null);
      loadLocalGovernmentData(selectedCounty.name);
    } catch (error) {
      console.error("Error saving unit:", error);
      alert("Failed to save unit.");
    }
  };

  const handleCommunityApplication = async (applicationData) => {
    try {
      await CommunityApplication.create({ ...applicationData, county: selectedCounty.name });
      setShowApplicationForm(false);
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };

  const handleEdit = (unit, type) => {
    setEditingUnit({ ...unit, type });
    setShowCreateForm(true);
  };
  
  const handleDelete = async (unit, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type.replace('_', ' ')}? This action cannot be undone.`)) {
      try {
        if (type === 'county_council') await CountyCouncil.delete(unit.id);
        if (type === 'district_council') await DistrictCouncil.delete(unit.id);
        if (type === 'parish_council') await ParishCouncil.delete(unit.id);
        loadLocalGovernmentData(selectedCounty.name);
        alert(`${type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)} deleted successfully.`);
      } catch (error) {
        console.error(`Failed to delete ${type}:`, error);
        alert(`Failed to delete ${type.replace('_', ' ')}.`);
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Local Government Structure...</div>;
  }
  
  if (!selectedCounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <Card className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-4">No County Selected</h2>
          <p className="text-slate-600 mb-6">Select a county to view its local government structure.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-blue-600 hover:bg-blue-700">Select County</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {selectedCounty.name} Local Government
                </h1>
                <p className="text-lg text-slate-600">County Council • District Councils • Parish Councils</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowApplicationForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Volunteer with Council
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  onClick={() => { setEditingUnit(null); setShowCreateForm(true); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Council
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-blue-600" />County Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Lord-Lieutenant</p>
                  <p className="font-semibold text-slate-900">{selectedCounty.lord_lieutenant || 'Position Vacant'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">High Sheriff</p>
                  <p className="font-semibold text-slate-900">{selectedCounty.sheriff || 'Position Vacant'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Deputies</p>
                  {leadership.filter(l => l.role === 'deputy').map(d => (
                    <p key={d.id} className="font-medium text-slate-800">{d.full_name}</p>
                  ))}
                  {leadership.filter(l => l.role === 'deputy').length === 0 && <p className="text-slate-500 italic">No deputies listed.</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Scale className="w-6 h-6 text-blue-600" />Government Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">County Councils:</span>
                  <span className="font-bold">{countyCouncils.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">District Councils:</span>
                  <span className="font-bold">{districtCouncils.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Parish Councils:</span>
                  <span className="font-bold">{parishCouncils.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Community Volunteers:</span>
                  <span className="font-bold">{communityVolunteers.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-green-600" />Next Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                {localEvents.length > 0 ? (
                  <div>
                    <p className="font-semibold">{localEvents[0].title}</p>
                    <p className="text-sm text-slate-600">{format(new Date(localEvents[0].date), "EEE, MMM d")}</p>
                    <p className="text-sm text-slate-500">{localEvents[0].location}</p>
                  </div>
                ) : <p className="text-slate-500 italic">No meetings scheduled.</p>}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="county" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="county">County Councils</TabsTrigger>
            <TabsTrigger value="district">District Councils</TabsTrigger>
            <TabsTrigger value="parish">Parish Councils</TabsTrigger>
            <TabsTrigger value="volunteers">Community Volunteers</TabsTrigger>
          </TabsList>

          <TabsContent value="county">
            <CountyCouncilOverview 
              countyCouncils={countyCouncils}
              selectedCounty={selectedCounty}
              user={user}
              onEdit={(unit) => handleEdit(unit, 'county_council')}
              onDelete={(unit) => handleDelete(unit, 'county_council')}
            />
          </TabsContent>

          <TabsContent value="district">
            <DistrictCouncilStructure 
              districtCouncils={districtCouncils}
              countyCouncils={countyCouncils}
              selectedCounty={selectedCounty}
              user={user}
              onEdit={(unit) => handleEdit(unit, 'district_council')}
              onDelete={(unit) => handleDelete(unit, 'district_council')}
            />
          </TabsContent>

          <TabsContent value="parish">
            <ParishCouncilDetails 
              parishCouncils={parishCouncils}
              districtCouncils={districtCouncils}
              selectedCounty={selectedCounty}
              user={user}
              onEdit={(unit) => handleEdit(unit, 'parish_council')}
              onDelete={(unit) => handleDelete(unit, 'parish_council')}
            />
          </TabsContent>

          <TabsContent value="volunteers">
            <CommunityVolunteers 
              communityVolunteers={communityVolunteers}
              parishCouncils={parishCouncils}
              districtCouncils={districtCouncils}
            />
          </TabsContent>
        </Tabs>

        {showCreateForm && (
          <CreateLocalGovernmentUnit
            onSubmit={handleSaveUnit}
            onCancel={() => { setShowCreateForm(false); setEditingUnit(null); }}
            countyCouncils={countyCouncils}
            districtCouncils={districtCouncils}
            unitToEdit={editingUnit}
          />
        )}

        {showApplicationForm && (
          <CommunityApplicationForm
            onSubmit={handleCommunityApplication}
            onCancel={() => setShowApplicationForm(false)}
            county={selectedCounty.name}
          />
        )}
      </div>
    </div>
  );
}