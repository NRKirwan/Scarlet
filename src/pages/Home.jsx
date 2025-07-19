
import React, { useState, useEffect } from "react";
import { County } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  const navigate = useNavigate();
  const [counties, setCounties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCounties();
  }, []);

  const loadCounties = async () => {
    try {
      const data = await County.list();
      // Sort counties alphabetically by name
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setCounties(sortedData);
    } catch (error) {
      console.error("Error loading counties:", error);
    }
    setIsLoading(false);
  };

  const filteredCounties = counties.filter(county => {
    const matchesSearch = county.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || county.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const countryColors = {
    England: "bg-red-100 text-red-800 border-red-200",
    Wales: "bg-green-100 text-green-800 border-green-200", 
    Scotland: "bg-blue-100 text-blue-800 border-blue-200",
    "Northern Ireland": "bg-orange-100 text-orange-800 border-orange-200",
    "Crown Dependency": "bg-amber-100 text-amber-800 border-amber-200",
    "Overseas Territory": "bg-teal-100 text-teal-800 border-teal-200"
  };

  const selectCounty = (county) => {
    localStorage.setItem('selectedCounty', JSON.stringify(county));
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-xl">
              <Crown className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-2">
                <span style={{color: '#FF2400'}}>Scarlet</span>
              </h1>
              <p className="text-xl text-slate-600 font-medium">British Community Network</p>
            </div>
          </div>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Unite with your local community through our comprehensive network supporting community services and heritage preservation under the British Crown.
          </p>
        </motion.div>

        {/* County Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-red-600" />
                Select Your County or Territory
              </CardTitle>
              <p className="text-slate-600">Choose your area to access local community resources and connect with neighbors</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search areas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "England", "Wales", "Scotland", "Northern Ireland", "Crown Dependency", "Overseas Territory"].map((country) => (
                    <Button
                      key={country}
                      variant={selectedCountry === country ? "default" : "outline"}
                      onClick={() => setSelectedCountry(country)}
                      className={`transition-all duration-200 ${
                        selectedCountry === country 
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg" 
                          : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      }`}
                    >
                      {country === "all" ? "All" : country}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Counties Grid */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {filteredCounties.map((county) => (
                      <motion.div
                        key={county.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm group h-full"
                          onClick={() => selectCounty(county)}
                        >
                          <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
                                    {county.name}
                                  </h3>
                                  <Badge className={`${countryColors[county.country]} border font-medium`}>
                                    {county.country}
                                  </Badge>
                                </div>
                                <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                                  {county.coat_of_arms ? (
                                    <img src={county.coat_of_arms} alt={`${county.name} crest`} className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <Shield className="w-8 h-8 text-slate-300 group-hover:text-red-500 transition-colors" />
                                  )}
                                </div>
                              </div>
                              
                              {county.description && (
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                  {county.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLoading && filteredCounties.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No areas found</h3>
                  <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Crown, title: "Local Leadership", desc: "Lord-Lieutenants & Sheriffs" },
            { icon: Search, title: "Community Care", desc: "Medical & support services" },
            { icon: MapPin, title: "Heritage Keeper", desc: "Custos Rotulum traditions" }
          ].map((feature, index) => (
            <Card key={index} className="text-center p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <feature.icon className="w-10 h-10 mx-auto mb-4 text-red-600" />
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
