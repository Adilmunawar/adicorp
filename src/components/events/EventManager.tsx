import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { CalendarPlus, Trash2 } from "lucide-react";
import { EventRow } from "@/types/events";

export default function EventManager() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "holiday" as const,
    description: ""
  });
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEvents();
    }
  }, [userProfile?.company_id]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .order('date');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleAddEvent = async () => {
    try {
      if (!userProfile?.company_id || !formData.title.trim()) return;

      const { error } = await supabase
        .from('events')
        .insert({
          company_id: userProfile.company_id,
          title: formData.title,
          type: formData.type,
          description: formData.description,
          date: selectedDate.toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Event Added",
        description: `${formData.title} has been added to the calendar.`,
      });

      setFormData({ title: "", type: "holiday", description: "" });
      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Event has been removed from the calendar.",
      });

      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-500/20 text-red-400';
      case 'working_day':
        return 'bg-green-500/20 text-green-400';
      case 'half_day':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const eventsForSelectedDate = events.filter(event => 
    event.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="glass-card lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-adicorp-purple" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border border-white/10 bg-adicorp-dark/30"
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4 bg-adicorp-purple hover:bg-adicorp-purple-dark">
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-adicorp-dark-light border-white/10">
              <DialogHeader>
                <DialogTitle>Add Event for {selectedDate.toLocaleDateString()}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="bg-adicorp-dark/60 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-adicorp-dark-light border-white/10">
                      <SelectItem value="holiday">Public Holiday (Full Pay)</SelectItem>
                      <SelectItem value="working_day">Special Working Day</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="bg-adicorp-dark/60 border-white/10"
                  />
                </div>
                
                <Button onClick={handleAddEvent} className="w-full bg-adicorp-purple hover:bg-adicorp-purple-dark">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Events for {selectedDate.toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-white/60">No events for this date.</p>
          ) : (
            <div className="space-y-4">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="flex justify-between items-start p-4 rounded-lg bg-adicorp-dark/30 border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge className={getEventBadgeColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-white/70 text-sm">{event.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
