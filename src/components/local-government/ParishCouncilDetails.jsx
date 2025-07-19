import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Calendar, Home, Edit, Trash, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function ParishCouncilDetails({ parishCouncils, districtCouncils, selectedCounty, user, onEdit, onDelete }) {
  const parishTypeColors = {
    civil_parish: "bg-green-100 text-green-800 border-green-200",
    town_council: "bg-blue-100 text-blue-800 border-blue-200",
    community_council: "bg-purple-100 text-purple-800 border-purple-200",
    neighbourhood_council: "bg-amber-100 text-amber-800 border-amber-200"
  };

  const parishesByDistrictId = parishCouncils.reduce((acc, parish) => {
    const id = parish.district_council_id || 'unassigned';
    if (!acc[id]) acc[id] = [];
    acc[id].push(parish);
    return acc;
  }, {});

  const districtDisplayGroups = districtCouncils.map(district => ({
    name: district.name,
    id: district.id,
    parishList: parishesByDistrictId[district.id] || []
  })).filter(group => group.parishList.length > 0);

  if (parishesByDistrictId['unassigned']) {
    districtDisplayGroups.push({
      name: 'Independent Parish Councils',
      id: 'unassigned',
      parishList: parishesByDistrictId['unassigned']
    });
  }

  return (
    <div className="space-y-6">
      {districtDisplayGroups.length > 0 ? (
        districtDisplayGroups.map(({ name: districtName, id: districtId, parishList }, index) => (
          <motion.div
            key={districtId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-600" />
                  {districtName} - Parish Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parishList.map((parish, pIndex) => {
                    const canModify = user && (user.role === 'admin' || user.email === parish.created_by);
                    return (
                      <motion.div
                        key={parish.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.1) + (pIndex * 0.05) }}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center">
                              {parish.parish_logo ? (
                                <img
                                  src={parish.parish_logo}
                                  alt={`${parish.name} logo`}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-slate-900">{parish.name}</h4>
                              {parish.parish_type && (
                                <Badge className={`${parishTypeColors[parish.parish_type]} mt-1`}>
                                  {parish.parish_type.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {canModify && (
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" onClick={() => onEdit(parish)}>
                                <Edit className="w-4 h-4 text-slate-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDelete(parish)}>
                                <Trash className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-slate-700">Ward Area</span>
                            </div>
                            <p className="text-slate-800 ml-6">{parish.ward_area}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Home className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-slate-700">Meeting Location</span>
                            </div>
                            <p className="text-slate-800 ml-6">{parish.headquarters}</p>
                          </div>

                          <div>
                            <p className="font-medium text-slate-700">Chairman:</p>
                            <p className="text-slate-800 ml-2">{parish.chairman || 'Position Vacant'}</p>
                          </div>

                          <div>
                            <p className="font-medium text-slate-700">Parish Clerk:</p>
                            <p className="text-slate-800 ml-2">{parish.clerk || 'Position Vacant'}</p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <div>
                              <span className="text-slate-500">Population: </span>
                              <span className="font-bold text-slate-900">{parish.population_served?.toLocaleString() || 0}</span>
                            </div>
                            {parish.meeting_schedule && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-xs text-slate-600">{parish.meeting_schedule}</span>
                              </div>
                            )}
                          </div>

                          {parish.precept && (
                            <div className="flex items-center gap-2 pt-2">
                              <Coins className="w-4 h-4 text-slate-500" />
                              <span className="text-xs text-slate-600">Annual Precept: £{parish.precept.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Parish Councils Listed</h3>
            <p className="text-slate-500">
              Parish-level organization has not been registered at the local community level.
              Contact District Council to add parish council information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}