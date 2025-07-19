import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityVolunteers({ communityVolunteers, parishCouncils, districtCouncils }) {
  const roleColors = {
    citizen: "bg-blue-100 text-blue-800 border-blue-200",
    deputy: "bg-green-100 text-green-800 border-green-200",
    sheriff: "bg-purple-100 text-purple-800 border-purple-200",
    lord_lieutenant: "bg-red-100 text-red-800 border-red-200",
    custos_rotulum: "bg-amber-100 text-amber-800 border-amber-200",
    medical_officer: "bg-pink-100 text-pink-800 border-pink-200",
    admin: "bg-slate-100 text-slate-800 border-slate-200"
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-green-600" />
          Community Volunteers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {communityVolunteers.length > 0 ? (
          <div className="space-y-3">
            {communityVolunteers.map((volunteer, index) => (
              <motion.div
                key={volunteer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {['lord_lieutenant', 'sheriff'].includes(volunteer.role) ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Users className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{volunteer.full_name}</p>
                    <p className="text-sm text-slate-600">{volunteer.email}</p>
                    {volunteer.bio && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{volunteer.bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={`${roleColors[volunteer.role]} capitalize font-medium`}>
                    {volunteer.role?.replace('_', ' ')}
                  </Badge>
                  {volunteer.specializations && volunteer.specializations.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {volunteer.specializations[0]}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Community Volunteers</h3>
            <p className="text-slate-500">
              No community volunteers have been registered for this county.
              Contact local councils to begin volunteer recruitment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}