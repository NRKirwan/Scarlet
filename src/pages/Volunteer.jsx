
import React, { useState, useEffect } from "react";
import { VolunteerService } from "@/api/entities";
import { VolunteerApplication } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Plus, Search, Users, HandHeart, Calendar, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import VolunteerApplicationForm from "../components/volunteer/VolunteerApplicationForm";
import CreateVolunteerServiceForm from "../components/volunteer/CreateVolunteerServiceForm";

export default function VolunteerPage() {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const county = JSON.parse(localStorage.getItem('selectedCounty') || 'null');
    setSelectedCounty(county);
    if (county) {
      loadServices(county.name);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadServices = async (countyName) => {
    try {
      const data = await VolunteerService.filter({ county: countyName });
      setServices(data);
    } catch (error) {
      console.error("Error loading volunteer services:", error);
    }
    setIsLoading(false);
  };
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ["all", "healthcare", "food_assistance", "elderly_care", "emergency_response", "education", "community_support", "environmental", "youth_programs"];
  
  const categoryColors = {
    healthcare: "bg-pink-100 text-pink-800 border-pink-200",
    food_assistance: "bg-orange-100 text-orange-800 border-orange-200",
    elderly_care: "bg-purple-100 text-purple-800 border-purple-200",
    emergency_response: "bg-red-100 text-red-800 border-red-200",
    education: "bg-blue-100 text-blue-800 border-blue-200",
    community_support: "bg-green-100 text-green-800 border-green-200",
    environmental: "bg-emerald-100 text-emerald-800 border-emerald-200",
    youth_programs: "bg-amber-100 text-amber-800 border-amber-200"
  };

  const handleVolunteerApplication = async (applicationData) => {
    try {
      await VolunteerApplication.create({
        ...applicationData,
        county: selectedCounty.name,
        service_id: selectedService.id,
        service_name: selectedService.name
      });
      setShowApplicationForm(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };

  const handleCreateService = async (serviceData) => {
    try {
      await VolunteerService.create({
        ...serviceData,
        county: selectedCounty.name
      });
      setShowCreateServiceForm(false);
      loadServices(selectedCounty.name);
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };
  
  if (!selectedCounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-8">
        <Card className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-4">No County Selected</h2>
          <p className="text-slate-600 mb-6">Select a county to view volunteer opportunities.</p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Community Volunteer Services
                </h1>
                <p className="text-lg text-slate-600">{selectedCounty.name} • Serve Your Neighbors</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateServiceForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />Register Service
            </Button>
          </div>
        </motion.div>
        
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search volunteer opportunities..."
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
                <div className="text-center py-8">Loading volunteer opportunities...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map(service => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <Link to={createPageUrl(`VolunteerServiceDetails?id=${service.id}`)} className="block h-full">
                        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <Badge className={`${categoryColors[service.category]} self-start capitalize mb-2`} variant="secondary">
                                {service.category.replace('_', ' ')}
                              </Badge>
                              <Heart className="w-5 h-5 text-pink-500" />
                            </div>
                            <CardTitle className="text-xl">{service.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow flex flex-col">
                            <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">{service.description}</p>
                            <div className="text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <span>Coordinator: {service.coordinator}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span>{service.location}</span>
                              </div>
                              {service.schedule && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span>{service.schedule}</span>
                                </div>
                              )}
                              {service.volunteers_needed && (
                                <div className="flex items-center gap-2">
                                  <HandHeart className="w-4 h-4 text-slate-500" />
                                  <span className="font-medium text-red-600">{service.volunteers_needed} volunteers needed</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              {!isLoading && filteredServices.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <HandHeart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>No volunteer opportunities found for the selected criteria.</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {showApplicationForm && selectedService && (
          <VolunteerApplicationForm
            service={selectedService}
            onSubmit={handleVolunteerApplication}
            onCancel={() => {
              setShowApplicationForm(false);
              setSelectedService(null);
            }}
            county={selectedCounty.name}
          />
        )}

        {showCreateServiceForm && (
          <CreateVolunteerServiceForm
            onSubmit={handleCreateService}
            onCancel={() => setShowCreateServiceForm(false)}
            county={selectedCounty.name}
          />
        )}
      </div>
    </div>
  );
}
