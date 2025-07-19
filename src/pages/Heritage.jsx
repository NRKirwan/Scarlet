
import React, { useState, useEffect } from "react";
import { HistoricalRecord } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Book, MapPin, Plus, Search, Scroll, Music, Landmark, User as UserIcon, Verified, Crown, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SubmitRecordForm from "../components/heritage/SubmitRecordForm";

export default function HeritagePage() {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    const county = JSON.parse(localStorage.getItem('selectedCounty') || 'null');
    setSelectedCounty(county);
    loadUserAndRecords(county);
  }, []);

  const loadUserAndRecords = async (county) => {
    try {
      const [currentUser, recordData] = await Promise.all([
        User.me().catch(() => null),
        county ? HistoricalRecord.filter({ county: county.name }) : []
      ]);
      
      setUser(currentUser);
      setRecords(recordData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmitRecord = async (recordData) => {
    try {
      await HistoricalRecord.create(recordData);
      setShowSubmitForm(false);
      // Reload records to show the new submission
      loadUserAndRecords(selectedCounty);
    } catch (error) {
      console.error("Error submitting record:", error);
    }
  };
  
  const filteredRecords = records.filter(record => {
    const recordCategory = record.category === 'architecture' ? 'locations' : record.category;
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recordCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ["all", "tradition", "music", "folklore", "locations", "notable_figures", "historical_events", "genealogy"];
  
  const categoryIcons = {
    tradition: Scroll,
    music: Music,
    folklore: Landmark,
    locations: Landmark,
    notable_figures: UserIcon,
    historical_events: Book,
    genealogy: UserIcon
  };

  const isCustosRotulum = user && user.role === 'custos_rotulum';

  if (!selectedCounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-8">
        <Card className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-4">No County Selected</h2>
          <p className="text-slate-600 mb-6">Select a county to view its local heritage and traditions.</p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Local Heritage & Traditions
                </h1>
                <p className="text-lg text-slate-600">Custos Rotulum of {selectedCounty.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isCustosRotulum && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-2 px-4 py-2">
                  <Crown className="w-4 h-4" />
                  Custos Rotulum
                </Badge>
              )}
              <Button 
                onClick={() => setShowSubmitForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />Submit Record
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Custos Rotulum Information Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0 bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-600" />
                The Role of Custos Rotulum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    The <strong>Custos Rotulum</strong> (Keeper of the Rolls) is the ancient office responsible for 
                    maintaining and preserving the historical records, traditions, and cultural heritage of the county. 
                    This role dates back to medieval times when the Custos was appointed to safeguard important 
                    documents and ensure the continuity of local customs.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Today, the Custos Rotulum continues this vital work by verifying historical records, 
                    authenticating local traditions, and ensuring that {selectedCounty.name}'s rich heritage 
                    is accurately preserved for future generations.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Verified className="w-4 h-4 text-green-600" />
                    Key Responsibilities:
                  </h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Verify and authenticate historical records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Preserve local traditions and customs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Maintain genealogical and family records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Document significant historical events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Oversee heritage site preservation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search records..."
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
                <div className="text-center py-8">Loading records...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecords.map(record => {
                    const category = record.category === 'architecture' ? 'locations' : record.category;
                    const Icon = categoryIcons[category] || Book;
                    return (
                      <motion.div key={record.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Link to={createPageUrl(`HeritageRecordDetails?id=${record.id}`)} className="block h-full group">
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-xl mb-2 group-hover:text-red-700 transition-colors">{record.title}</CardTitle>
                                  <Badge variant="secondary" className="capitalize">{category.replace('_', ' ')}</Badge>
                                </div>
                                <Icon className="w-6 h-6 text-slate-400 flex-shrink-0 ml-2" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 mb-4 line-clamp-4">{record.description}</p>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Period: {record.time_period || 'N/A'}</span>
                                {record.verified && (
                                  <Badge variant="outline" className="text-green-700 border-green-200">
                                    <Verified className="w-3 h-3 mr-1" /> 
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              {record.contributor && (
                                <p className="text-xs text-slate-400 mt-2">
                                  Contributed by: {record.contributor}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}
              {!isLoading && filteredRecords.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Scroll className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>No historical records found for the selected criteria.</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {showSubmitForm && (
          <SubmitRecordForm
            onSubmit={handleSubmitRecord}
            onCancel={() => setShowSubmitForm(false)}
            county={selectedCounty.name}
            userEmail={user?.email}
            userName={user?.full_name}
          />
        )}
      </div>
    </div>
  );
}
