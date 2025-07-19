
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { HistoricalRecord } from '@/api/entities';
import { User } from "@/api/entities"; // New import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Scroll, Music, Landmark, User as UserIcon, Verified, Loader2, ArrowLeft, ChevronsRight, Copy, Trash, Edit } from 'lucide-react'; // Added Copy, Trash, Edit
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import MediaGallery from '@/components/heritage/MediaGallery';
import SubmitRecordForm from "../components/heritage/SubmitRecordForm"; // New import

const categoryIcons = {
  tradition: Scroll,
  music: Music,
  folklore: Landmark,
  locations: Landmark,
  architecture: Landmark, // Keep for old records
  notable_figures: UserIcon,
  historical_events: Book,
  genealogy: UserIcon
};

export default function HeritageRecordDetailsPage() {
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('id');
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // New state
  const [isEditing, setIsEditing] = useState(false); // New state
  const navigate = useNavigate(); // New hook

  useEffect(() => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }

    const loadRecordData = async () => {
      setIsLoading(true); // Ensure loading state is true when starting to load
      try {
        const data = await HistoricalRecord.get(recordId);
        setRecord(data);
      } catch (error) {
        console.error("Error loading historical record:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordData();
    // Fetch user data
    User.me().then(setUser).catch(() => setUser(null));
  }, [recordId]);

  const handleUpdate = async (updatedData) => {
    if (!record) return;
    try {
      await HistoricalRecord.update(record.id, updatedData);
      setIsEditing(false);
      // Reload the record to show updated data
      const updatedRecord = await HistoricalRecord.get(record.id);
      setRecord(updatedRecord);
    } catch (error) {
      console.error("Failed to update record:", error);
      alert("Failed to update record.");
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    if (window.confirm("Are you sure you want to delete this historical record? This action cannot be undone.")) {
      try {
        await HistoricalRecord.delete(record.id);
        alert("Record deleted successfully.");
        navigate(createPageUrl("Heritage"));
      } catch (error) {
        console.error("Failed to delete record:", error);
        alert("Failed to delete record.");
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Record Not Found</h2>
        <p className="text-slate-600 mb-6">The historical record you are looking for does not exist.</p>
        <Link to={createPageUrl("Heritage")}>
          <Button className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Heritage Page
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = categoryIcons[record.category] || Book;
  const displayCategory = record.category === 'architecture' ? 'locations' : record.category;
  const canModify = user && record && (user.role === 'admin' || user.email === record.created_by); // New logic

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
      {isEditing ? (
        <SubmitRecordForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          county={record.county}
          userEmail={user?.email}
          userName={user?.full_name}
          recordToEdit={record}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* The previous "Back to Heritage" button is now integrated into CardHeader */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm w-full">
              <CardHeader className="border-b border-slate-200">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link to={createPageUrl("Heritage")} className="text-sm text-red-600 hover:underline mb-2 inline-block">
                      &larr; Back to Local Heritage
                    </Link>
                    <CardTitle className="text-3xl font-bold text-slate-900">{record.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {displayCategory.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-slate-500">Period: {record.time_period || 'N/A'}</span>
                      {record.verified && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          <Verified className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
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
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed">
                  <p>{record.description}</p>
                </div>

                {/* Media Gallery */}
                {record.media_urls?.length > 0 && (
                  <MediaGallery
                    mediaUrls={record.media_urls}
                    mediaTypes={record.media_types}
                  />
                )}

                {/* Keep existing verified badge here, as it's a different style/placement */}
                {record.verified && (
                  <div className="mt-8 flex justify-center">
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-6 py-2 flex items-center gap-2">
                      <Verified className="w-5 h-5" />
                      Verified by the Custos Rotulum
                    </Badge>
                  </div>
                )}

                {(record.sources?.length > 0 || record.contributor) && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Provenance</h3>
                    <div className="space-y-3">
                      {record.sources?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700">Sources:</h4>
                          <ul className="list-none space-y-1 mt-2">
                            {record.sources.map((source, index) => (
                              <li key={index} className="flex items-start gap-2 text-slate-600">
                                <ChevronsRight className="w-4 h-4 mt-1 text-amber-500 flex-shrink-0" />
                                <span>{source}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.contributor && (
                        <div>
                          <h4 className="font-semibold text-slate-700">Contributor:</h4>
                          <p className="text-slate-600">{record.contributor}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
