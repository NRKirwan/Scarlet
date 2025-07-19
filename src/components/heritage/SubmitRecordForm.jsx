
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, Loader2, FileText, Image, Music, Video, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { UploadFile } from "@/api/integrations";

export default function SubmitRecordForm({ onSubmit, onCancel, county, userEmail, userName, recordToEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    time_period: '',
    sources: [''],
    contributor: userName || '',
    contributor_email: userEmail || ''
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        title: recordToEdit.title || '',
        category: recordToEdit.category || '',
        description: recordToEdit.description || '',
        time_period: recordToEdit.time_period || '',
        sources: recordToEdit.sources?.length ? recordToEdit.sources : [''],
        contributor: recordToEdit.contributor || userName || '',
        contributor_email: recordToEdit.contributor_email || userEmail || ''
      });
      if (recordToEdit.media_urls && recordToEdit.media_types) {
        const media = recordToEdit.media_urls.map((url, i) => ({
          url,
          type: recordToEdit.media_types[i],
          name: url.split('/').pop() // Extract filename from URL
        }));
        setExistingMedia(media);
      }
    }
  }, [recordToEdit, userName, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingFiles(true);

    try {
      let mediaUrls = existingMedia.map(m => m.url);
      let mediaTypes = existingMedia.map(m => m.type);

      // Upload all newly selected files
      for (const file of mediaFiles) {
        const uploadResult = await UploadFile({ file: file.file });
        mediaUrls.push(uploadResult.file_url);
        mediaTypes.push(file.type);
      }

      const recordData = {
        ...formData,
        county: county,
        sources: formData.sources.filter(source => source.trim() !== ''),
        media_urls: mediaUrls,
        media_types: mediaTypes
      };
      
      // For new records, set verification status. For updates, don't change automatically.
      if (!recordToEdit) {
        recordData.verified = false;
        recordData.status = 'pending';
      }

      onSubmit(recordData);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    }
    setUploadingFiles(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSourceChange = (index, value) => {
    const newSources = [...formData.sources];
    newSources[index] = value;
    setFormData(prev => ({ ...prev, sources: newSources }));
  };

  const addSource = () => {
    setFormData(prev => ({ ...prev, sources: [...prev.sources, ''] }));
  };

  const removeSource = (index) => {
    const newSources = formData.sources.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, sources: newSources.length ? newSources : [''] }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMediaFiles = files.map(file => {
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      
      return { file, type, name: file.name };
    });
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              {recordToEdit ? <Edit className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-amber-600" />}
              {recordToEdit ? `Edit Historical Record` : `Submit Historical Record for ${county}`}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="e.g., The Legend of the Dunstable Swan"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tradition">Tradition</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="folklore">Folklore</SelectItem>
                  <SelectItem value="locations">Locations</SelectItem>
                  <SelectItem value="notable_figures">Notable Figures</SelectItem>
                  <SelectItem value="historical_events">Historical Events</SelectItem>
                  <SelectItem value="genealogy">Genealogy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time_period">Time Period</Label>
              <Input
                id="time_period"
                value={formData.time_period}
                onChange={(e) => handleInputChange('time_period', e.target.value)}
                placeholder="e.g., Medieval Period, 1850-1900, Victorian Era"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of this historical record..."
                required
                className="h-32"
              />
            </div>

            <div>
              <Label>Sources and References</Label>
              <div className="space-y-2">
                {formData.sources.map((source, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={source}
                      onChange={(e) => handleSourceChange(index, e.target.value)}
                      placeholder="e.g., Bedfordshire Historical Society Archives, Volume 12"
                      className="flex-1"
                    />
                    {formData.sources.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSource(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSource} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Source
                </Button>
              </div>
            </div>

            <div>
              <Label>Media Files (Images, Audio, Video, Documents)</Label>
              <div className="space-y-4">
                <div className="border border-dashed border-slate-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <Upload className="w-8 h-8" />
                      <p className="text-sm">Click to upload images, audio, video, or documents</p>
                      <p className="text-xs text-slate-500">Supports: JPG, PNG, MP3, MP4, PDF, DOC</p>
                    </div>
                  </label>
                </div>
                
                {existingMedia.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Existing Files:</h4>
                    {existingMedia.map((file, index) => (
                      <div key={`existing-${index}`} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">{file.name}</a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExistingFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
                    {mediaFiles.map((file, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contributor">Your Name</Label>
              <Input
                id="contributor"
                value={formData.contributor}
                onChange={(e) => handleInputChange('contributor', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="contributor_email">Your Email</Label>
              <Input
                id="contributor_email"
                type="email"
                value={formData.contributor_email}
                onChange={(e) => handleInputChange('contributor_email', e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={uploadingFiles}>
                {uploadingFiles ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  recordToEdit ? 'Save Changes' : 'Submit Record'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
