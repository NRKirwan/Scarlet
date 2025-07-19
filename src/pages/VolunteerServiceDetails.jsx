
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { VolunteerService } from '@/api/entities';
import { VolunteerApplication } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Users, Calendar, UserCheck, Loader2, Phone, CheckCircle, AlertCircle, Copy, Trash, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import VolunteerApplicationForm from '@/components/volunteer/VolunteerApplicationForm';
import CreateVolunteerServiceForm from '@/components/volunteer/CreateVolunteerServiceForm';
import { InvokeLLM } from '@/api/integrations';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const categoryColors = {
  healthcare: "bg-pink-100 text-pink-800",
  food_assistance: "bg-orange-100 text-orange-800",
  elderly_care: "bg-purple-100 text-purple-800",
  emergency_response: "bg-red-100 text-red-800",
  education: "bg-blue-100 text-blue-800",
  community_support: "bg-green-100 text-green-800",
  environmental: "bg-emerald-100 text-emerald-800",
  youth_programs: "bg-amber-100 text-amber-800"
};

export default function VolunteerServiceDetailsPage() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('id');
  const [service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const loadServiceData = useCallback(async () => {
    if (!serviceId) {
      setIsLoading(false);
      return;
    }
    try {
      const serviceData = await VolunteerService.get(serviceId);
      setService(serviceData);

      // If service doesn't have coordinates, attempt to get them
      if (!serviceData.latitude || !serviceData.longitude) {
        lookupCoordinates(serviceData);
      }

      const [currentUser, applications] = await Promise.all([
        User.me().catch(() => null),
        VolunteerApplication.filter({ service_id: serviceId })
      ]);
      
      setUser(currentUser);
      setApplicationCount(applications.length);
      
      if (currentUser) {
        const application = applications.find(a => a.applicant_email === currentUser.email);
        setUserApplication(application || null);
      }
    } catch (error) {
      console.error("Error loading service data:", error);
      // If the service is not found, ensure service state is null
      if (error.response && error.response.status === 404) {
        setService(null);
      }
    }
    setIsLoading(false);
  }, [serviceId]);

  const lookupCoordinates = async (serviceData) => {
    if (!serviceData.location) return;
    
    setIsLoadingCoordinates(true);
    try {
      const response = await InvokeLLM({
        prompt: `Find the exact latitude and longitude coordinates for this location: "${serviceData.location}, ${serviceData.county}, UK". Return only a JSON object with "latitude" and "longitude" as decimal numbers. If the location cannot be found, return null for both values.`,
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
        const updatedService = {
          ...serviceData,
          latitude: response.latitude,
          longitude: response.longitude
        };
        await VolunteerService.update(serviceId, { 
          latitude: response.latitude, 
          longitude: response.longitude 
        });
        setService(updatedService);
      }
    } catch (error) {
      console.error("Error looking up coordinates:", error);
    }
    setIsLoadingCoordinates(false);
  };

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);
  
  const handleApplication = async (applicationData) => {
    try {
      await VolunteerApplication.create({
        ...applicationData,
        county: service.county,
        service_id: service.id,
        service_name: service.name
      });
      setShowApplicationForm(false);
      // Reload to get updated application
      loadServiceData();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  const handleUpdate = async (updatedData) => {
    if (!service) return;
    try {
      await VolunteerService.update(service.id, updatedData);
      setIsEditing(false);
      loadServiceData(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to update service:", error);
      alert("Failed to update service.");
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (window.confirm("Are you sure you want to delete this volunteer service? This action cannot be undone.")) {
      try {
        await VolunteerService.delete(service.id);
        alert("Service deleted successfully.");
        navigate(createPageUrl("Volunteer"));
      } catch (error) {
        console.error("Failed to delete service:", error);
        alert("Failed to delete service.");
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

  if (!service) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="text-slate-600 mb-6">The volunteer service you are looking for does not exist.</p>
        <Link to={createPageUrl("Volunteer")}>
          <Button className="bg-red-600 hover:bg-red-700">Back to Volunteer Services</Button>
        </Link>
      </div>
    );
  }

  const position = service.latitude && service.longitude ? [service.latitude, service.longitude] : null;
  const canModify = user && (user.role === 'admin' || user.email === service.created_by);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
      {isEditing ? (
        <div className="max-w-3xl mx-auto py-8">
          <CreateVolunteerServiceForm
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            county={service.county}
            serviceToEdit={service}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Link to={createPageUrl("Volunteer")} className="text-sm text-red-600 hover:underline mb-2 inline-block">&larr; Back to Volunteer Services</Link>
                  <CardTitle className="text-3xl font-bold text-slate-900">{service.name}</CardTitle>
                  <Badge className={`${categoryColors[service.category]} self-start capitalize mt-2`} variant="secondary">
                    {service.category.replace('_', ' ')}
                  </Badge>
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
            <CardContent className="pt-6">
              {!userApplication ? (
                <Button 
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-pink-600 hover:bg-pink-700 w-full mb-6"
                  disabled={!user}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Apply to Volunteer
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-700 mb-6 py-2 px-4 border border-green-200 rounded-md bg-green-50">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Application Submitted</span>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Service Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={`${categoryColors[service.category]} capitalize`}>
                            {service.category.replace('_', ' ')}
                          </Badge>
                          <Heart className="w-6 h-6 text-pink-500" />
                        </div>
                        <CardTitle className="text-2xl">Service Description</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {service.description}
                        </p>
                        
                        {service.requirements && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-amber-800 mb-1">Requirements</h4>
                                <p className="text-amber-700">{service.requirements}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {service.training_provided && (
                          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-green-800 mb-1">Training Provided</h4>
                                <p className="text-green-700">Full training will be provided for this volunteer role.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Map */}
                  {position && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-red-600" />
                            Service Location
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-96 rounded-lg overflow-hidden">
                            <MapContainer 
                              center={position} 
                              zoom={13} 
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <Marker position={position}>
                                <Popup>
                                  <div className="text-center">
                                    <h3 className="font-bold">{service.name}</h3>
                                    <p className="text-sm">{service.location}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                          {isLoadingCoordinates && (
                            <div className="flex items-center justify-center py-4 text-slate-500">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading map coordinates...
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-blue-600" />
                          Contact Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500">Service Coordinator</p>
                          <p className="font-semibold text-slate-900">{service.coordinator}</p>
                        </div>
                        {service.contact_info && (
                          <div>
                            <p className="text-sm text-slate-500">Contact Information</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-500" />
                              {service.contact_info}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-medium text-slate-800 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            {service.location}
                          </p>
                        </div>
                        {service.schedule && (
                          <div>
                            <p className="text-sm text-slate-500">Schedule</p>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {service.schedule}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Volunteer Statistics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Heart className="w-6 h-6 text-pink-600" />
                          Volunteer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {service.volunteers_needed && (
                          <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl">
                            <div className="text-2xl font-bold text-pink-700 mb-1">
                              {service.volunteers_needed}
                            </div>
                            <p className="text-sm text-pink-600">Volunteers Needed</p>
                          </div>
                        )}
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-700 mb-1">
                            {applicationCount}
                          </div>
                          <p className="text-sm text-blue-600">Applications Received</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Application Status */}
                  {userApplication && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Your Application
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-slate-500">Status</p>
                              <Badge className="capitalize mt-1">
                                {userApplication.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Applied On</p>
                              <p className="font-medium text-slate-800">
                                {new Date(userApplication.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && (
        <VolunteerApplicationForm
          service={service}
          onSubmit={handleApplication}
          onCancel={() => setShowApplicationForm(false)}
          county={service.county}
        />
      )}
    </div>
  );
}
