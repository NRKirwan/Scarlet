import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Crown, Users, Scale, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function CountyCouncilOverview({ countyCouncils, selectedCounty, user, onEdit, onDelete }) {
  const councilTypeColors = {
    county: "bg-blue-100 text-blue-800 border-blue-200",
    unitary: "bg-purple-100 text-purple-800 border-purple-200",
    metropolitan: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <div className="space-y-6">
      {countyCouncils.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {countyCouncils.map((council, index) => {
            const canModify = user && (user.role === 'admin' || user.email === council.created_by);
            return (
              <motion.div
                key={council.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                          {council.council_logo ? (
                            <img 
                              src={council.council_logo} 
                              alt={`${council.name} logo`} 
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                            {council.name}
                          </CardTitle>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            County Council
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canModify && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(council)}>
                              <Edit className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(council)}>
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Scale className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Headquarters</p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {council.headquarters}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Population Served</p>
                        <p className="font-bold text-lg">{council.population_served?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Council Leader</p>
                        <p className="font-medium flex items-center gap-2">
                          <Crown className="w-4 h-4 text-blue-600" />
                          {council.council_leader || 'Vacant'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Chief Executive</p>
                        <p className="font-medium">{council.chief_executive || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {council.key_services && council.key_services.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Key Services
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {council.key_services.slice(0, 3).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {council.key_services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{council.key_services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No County Councils Listed</h3>
            <p className="text-slate-500">
              This county does not yet have county council information registered. 
              Contact local administration to add council details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}