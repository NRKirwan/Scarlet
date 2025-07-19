import React, { useState } from 'react';
import { Event } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cog } from 'lucide-react';

export default function AdminTools() {
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [updated, setUpdated] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [log, setLog] = useState([]);

    const updateCoordinates = async () => {
        setIsProcessing(true);
        setLog([]);
        setProgress(0);
        setUpdated(0);

        const allEvents = await Event.list();
        const eventsToUpdate = allEvents.filter(e => !e.latitude || !e.longitude);
        setTotal(eventsToUpdate.length);
        
        if (eventsToUpdate.length === 0) {
            setLog(prev => [...prev, "All events already have coordinates. Nothing to do."]);
            setIsProcessing(false);
            return;
        }

        setLog(prev => [...prev, `Found ${eventsToUpdate.length} events to process...`]);

        for (let i = 0; i < eventsToUpdate.length; i++) {
            const event = eventsToUpdate[i];
            
            try {
                const response = await InvokeLLM({
                    prompt: `Find the exact latitude and longitude coordinates for this location: "${event.location}, ${event.county}, UK". This should be a specific place like a town hall, church, park, or street address. Return only a JSON object with "latitude" and "longitude" as decimal numbers. If the location cannot be found, return null for both values.`,
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

                if (response && response.latitude && response.longitude) {
                    await Event.update(event.id, { latitude: response.latitude, longitude: response.longitude });
                    setLog(prev => [...prev, `  -> SUCCESS: Updated coordinates for "${event.title}"`]);
                    setUpdated(prev => prev + 1);
                } else {
                    setLog(prev => [...prev, `  -> SKIPPED: Could not find coordinates for "${event.title}" at location "${event.location}"`]);
                }
            } catch (error) {
                console.error(`Failed to process event ${event.id}:`, error);
                setLog(prev => [...prev, `  -> ERROR: Failed to process "${event.title}".`]);
            }
            
            setProgress(((i + 1) / eventsToUpdate.length) * 100);
        }
        
        setLog(prev => [...prev, "Processing complete!"]);
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-4 md:p-8">
            <Card className="max-w-3xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl"><Cog className="w-8 h-8 text-red-600"/> Admin Tools</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Retrospectively Add Coordinates to Events</h3>
                    <p className="text-slate-600 mb-6">This tool will find all existing events that are missing map coordinates. It will attempt to look up the coordinates based on the event's location and county, and then save them. This may take some time depending on the number of events. You can monitor the progress below.</p>
                    
                    <Button onClick={updateCoordinates} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
                        {isProcessing ? 'Processing...' : 'Start Coordinate Update'}
                    </Button>

                    {(isProcessing || log.length > 0) && (
                        <div className="mt-6 space-y-4">
                            {isProcessing && total > 0 && (
                                <div>
                                    <Progress value={progress} className="w-full" />
                                    <p className="text-center mt-2 text-sm text-slate-500">{updated} / {total} events updated</p>
                                </div>
                            )}

                            {log.length > 0 && (
                                <div className="p-4 bg-slate-900 text-white rounded-lg font-mono text-xs max-h-80 overflow-y-auto">
                                    {log.map((entry, index) => (
                                        <p key={index} className={entry.includes('SUCCESS') ? 'text-green-400' : entry.includes('SKIPPED') ? 'text-yellow-400' : entry.includes('ERROR') ? 'text-red-400' : ''}>
                                            {entry}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}