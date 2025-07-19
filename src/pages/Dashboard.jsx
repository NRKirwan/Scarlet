
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Event } from "@/api/entities";
import { VolunteerService } from "@/api/entities";
import { HistoricalRecord } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Users, Calendar, Heart, Book, MapPin, Bell, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [user, setUser] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const county = JSON.parse(localStorage.getItem('selectedCounty') || 'null');
      setSelectedCounty(county);
      const currentUser = await User.me();
      setUser(currentUser);

      if (county) {
        const [events, services, records] = await Promise.all([
          Event.filter({ county: county.name }, '-created_date', 5),
          VolunteerService.filter({ county: county.name }, '-created_date', 5),
          HistoricalRecord.filter({ county: county.name }, '-created_date', 5),
        ]);

        const allSubmissions = [
          ...events.map(item => ({ ...item, type: 'Event' })),
          ...services.map(item => ({ ...item, type: 'VolunteerService' })),
          ...records.map(item => ({ ...item, type: 'HistoricalRecord' }))

        ];

        allSubmissions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setRecentSubmissions(allSubmissions.slice(0, 6));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const roleColors = {
    citizen: "bg-blue-100 text-blue-800",
    deputy: "bg-green-100 text-green-800",
    sheriff: "bg-purple-100 text-purple-800",
    lord_lieutenant: "bg-red-100 text-red-800",
    custos_rotulum: "bg-amber-100 text-amber-800",
    medical_officer: "bg-pink-100 text-pink-800"
  };

  const submissionTypeInfo = {
    Event: {
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      getLink: (item) => createPageUrl(`EventDetails?id=${item.id}`),
      getTitle: (item) => item.title,
      getDetail: (item) => item.category.replace(/_/g, ' '),
    },
    VolunteerService: {
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      getLink: (item) => createPageUrl(`VolunteerServiceDetails?id=${item.id}`),
      getTitle: (item) => item.name,
      getDetail: (item) => item.category.replace(/_/g, ' '),
    },
    HistoricalRecord: {
      icon: Book,
      color: "from-amber-500 to-amber-600",
      getLink: (item) => createPageUrl(`HeritageRecordDetails?id=${item.id}`),
      getTitle: (item) => item.title,
      getDetail: (item) => item.category.replace(/_/g, ' '),
    },
  };

  if (!selectedCounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-8">
        <Card className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-4">No County Selected</h2>
          <p className="text-slate-600 mb-6">Please select your county to access the community dashboard.</p>
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
        {/* County Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl p-1">
                {selectedCounty.coat_of_arms ? (
                  <img src={selectedCounty.coat_of_arms} alt={`${selectedCounty.name} crest`} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {selectedCounty.name}
                </h1>
                <p className="text-lg text-slate-600">{selectedCounty.country} • Community Dashboard</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <Badge className={`${roleColors[user.role]} border font-medium`}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-slate-700 font-medium">Welcome, {user.full_name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              icon: Building2,
              title: "Local Government",
              desc: "County, district & parish councils",
              link: "LocalGovernment",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: Calendar,
              title: "Community Events",
              desc: "Local gatherings & activities",
              link: "Events",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: Heart,
              title: "Volunteer Services",
              desc: "Community support & assistance",
              link: "Volunteer",
              color: "from-pink-500 to-pink-600"
            },
            {
              icon: Book,
              title: "Local Heritage",
              desc: "Traditions & historical records",
              link: "Heritage",
              color: "from-amber-500 to-amber-600"
            },
            {
              icon: Users,
              title: "Community Support",
              desc: "Neighborhood assistance",
              link: "Dashboard",
              color: "from-green-500 to-green-600"
            },
            {
              icon: Crown,
              title: "Leadership",
              desc: "County officials & deputies",
              link: "Dashboard",
              color: "from-purple-500 to-purple-600"
            },
          ].map((action, index) => (
            <Link key={index} to={createPageUrl(action.link)}>
              <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-600">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-red-600" />
                  Recent Community Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                {recentSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubmissions.map((item) => {
                      const info = submissionTypeInfo[item.type];
                      if (!info) return null;
                      const IconComponent = info.icon;

                      return (
                        <Link to={info.getLink(item)} key={`${item.type}-${item.id}`} className="block group">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group-hover:shadow-md">
                            <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors">{info.getTitle(item)}</h4>
                              <p className="text-sm text-slate-600 capitalize">{info.getDetail(item)}</p>
                              <p className="text-xs text-slate-500">
                                Submitted on {format(new Date(item.created_date), "MMM d, yyyy")}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {item.type.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No recent submissions to display.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* County Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-gold-600" />
                  County Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedCounty.lord_lieutenant && (
                  <div>
                    <p className="text-sm text-slate-500">Lord-Lieutenant</p>
                    <p className="font-semibold text-slate-900">{selectedCounty.lord_lieutenant}</p>
                  </div>
                )}
                {selectedCounty.sheriff && (
                  <div>
                    <p className="text-sm text-slate-500">County Sheriff</p>
                    <p className="font-semibold text-slate-900">{selectedCounty.sheriff}</p>
                  </div>
                )}
                {selectedCounty.population && (
                  <div>
                    <p className="text-sm text-slate-500">Population</p>
                    <p className="font-semibold text-slate-900">{selectedCounty.population.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedCounty.traditions && selectedCounty.traditions.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3">
                    <Book className="w-6 h-6 text-amber-600" />
                    Local Traditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {selectedCounty.traditions.slice(0, 3).map((tradition, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {tradition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
