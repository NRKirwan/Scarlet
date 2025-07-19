import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Landmark, MapPin, Users, Building2, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function DistrictCouncilStructure({ districtCouncils, countyCouncils, selectedCounty, user, onEdit, onDelete }) {
  const districtTypeColors = {
    district: "bg-green-100 text-green-800 border-green-200",
    borough: "bg-blue-100 text-blue-800 border-blue-200",
    city: "bg-purple-100 text-purple-800 border-purple-200",
    metropolitan_borough: "bg-orange-100 text-orange-800 border-orange-200",
    unitary_authority: "bg-red-100 text-red-800 border-red-200"
  };

  const groupedDistricts = districtCouncils.reduce((acc, district) => {
    const countyId = district.county_council_id || 'unassigned';
    if (!acc[countyId]) {
      acc[countyId] = [];
    }
    acc[countyId].push(district);
    return acc;
  }, {});

  const countiesWithDistricts = countyCouncils.filter(c => groupedDistricts[c.id]);
  const unassignedDistricts = groupedDistricts['unassigned'];

  const renderDistrict = (district, dIndex, index) => {
    const canModify = user && (user.role === 'admin' || user.email === district.created_by);
    return (
      <motion.div
        key={district.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (index * 0.1) + (dIndex * 0.05) }}
        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center">
              {district.district_logo ? (
                <img 
                  src={district.district_logo} 
                  alt={`${district.name} logo`} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h4 className="font-bold text-slate-900">{district.name}</h4>
          </div>
          {canModify && (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => onEdit(district)}>
                <Edit className="w-4 h-4 text-slate-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(district)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">{district.geographic_area}</span>
          </div>
          
          <div>
            <p className="text-slate-500">Headquarters:</p>
            <p className="font-medium text-slate-800">{district.headquarters}</p>
          </div>
          
          <div>
            <p className="text-slate-500">Council Leader:</p>
            <p className="font-medium text-slate-800">{district.council_leader || 'Vacant'}</p>
          </div>

          {district.mayor && (
            <div>
              <p className="text-slate-500">Mayor:</p>
              <p className="font-medium text-slate-800">{district.mayor}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{district.population_served?.toLocaleString() || 0}</span>
            </div>
            {district.district_type && (
              <Badge className={`${districtTypeColors[district.district_type]} text-xs`}>
                {district.district_type.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {countiesWithDistricts.length > 0 || unassignedDistricts ? (
        <>
          {countiesWithDistricts.map((county, index) => (
            <motion.div
              key={county.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    {county.name} - District Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedDistricts[county.id].map((district, dIndex) => renderDistrict(district, dIndex, index))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {unassignedDistricts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: countiesWithDistricts.length * 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-slate-500" />
                    Independent District Councils
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unassignedDistricts.map((district, dIndex) => renderDistrict(district, dIndex, countiesWithDistricts.length))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Landmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No District Councils Listed</h3>
            <p className="text-slate-500">
              District council structure has not been registered for this county's administrative regions.
              Contact local government to add district council information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}