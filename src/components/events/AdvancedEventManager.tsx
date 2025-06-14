
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format, addDays, isSameDay } from "date-fns";
import { 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle 
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'holiday' | 'working_day' | 'half_day' | 'off_day' | 'meeting' | 'training';
  affects_attendance: boolean;
  company_id: string;
  created_at: string;
}

const EVENT_TYPES = [
  { value: 'holiday', label: 'Public Holiday', icon: '🏖️', affects_attendance: true },
  { value: 'off_day', label: 'Company Off Day', icon: '🏠', affects_attendance: true },
  { value: 'working_day', label: 'Special Working Day', icon: '💼', affects_attendance: false },
  { value: 'half_day', label: 'Half Day', icon: '🕛', affects_attendance: true },
  { value: 'meeting', label: 'Company Meeting', icon: '📋', affects_attendance: false },
  { value: 'training', label: 'Training Session', icon: '🎓', affects_attendance: false },
];

export default function AdvancedEventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'holiday' as Event['type'],
    affects_attendance: true,
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
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.company_id) return;

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        company_id: userProfile.company_id,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) throw error;
        toast({ title: "Event updated successfully!" });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        if (error) throw error;
        toast({ title: "Event created successfully!" });
      }

      fetchEvents();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast({ title: "Event deleted successfully!" });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'holiday',
      affects_attendance: true,
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      affects_attendance: event.affects_attendance,
    });
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setShowForm(true);
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const handleTypeChange = (type: string) => {
    const typeInfo = getEventTypeInfo(type);
    setFormData(prev => ({
      ...prev,
      type: type as Event['type'],
      affects_attendance: typeInfo.affects_attendance,
    }));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            Advanced Event Manager
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Event'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <Label className="text-sm text-white/60 mb-2 block">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-white/10 bg-adicorp-dark/50"
              modifiers={{
                event: (date) => getEventsForDate(date).length > 0,
                holiday: (date) => getEventsForDate(date).some(e => e.type === 'holiday' || e.type === 'off_day'),
              }}
              modifiersStyles={{
                event: { backgroundColor: 'rgba(139, 92, 246, 0.3)' },
                holiday: { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
              }}
            />
          </div>

          {/* Event Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-adicorp-dark/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="affects_attendance">Affects Attendance</Label>
                <Switch
                  id="affects_attendance"
                  checked={formData.affects_attendance}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, affects_attendance: checked }))
                  }
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                  Selected Date: <span className="font-medium">{format(selectedDate, 'PPP')}</span>
                </p>
                {formData.affects_attendance && (
                  <p className="text-xs text-orange-300 mt-1">
                    ⚠️ This event will affect attendance calculations
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          )}

          {/* Events for Selected Date */}
          {!showForm && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-white/60 mb-2 block">
                  Events on {format(selectedDate, 'PPP')}
                </Label>
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <div key={event.id} className="p-3 bg-adicorp-dark/30 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span>{typeInfo.icon}</span>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(event)}
                              className="border-white/10 hover:bg-adicorp-dark"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(event.id)}
                              className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Badge variant="secondary" className="bg-adicorp-purple/20 text-adicorp-purple">
                            {typeInfo.label}
                          </Badge>
                          {event.affects_attendance && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Affects Attendance
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-white/70 mt-2">{event.description}</p>
                        )}
                      </div>
                    );
                  })}
                  {getEventsForDate(selectedDate).length === 0 && (
                    <p className="text-white/40 text-center py-4">No events for this date</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div>
          <Label className="text-sm text-white/60 mb-3 block">Recent Events</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {events.slice(0, 9).map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              return (
                <div key={event.id} className="p-3 bg-adicorp-dark/20 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{event.title}</span>
                    <span className="text-xs text-white/60">{typeInfo.icon}</span>
                  </div>
                  <p className="text-xs text-white/60">{format(new Date(event.date), 'MMM dd, yyyy')}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Badge variant="secondary" className="text-xs bg-adicorp-purple/10 text-adicorp-purple">
                      {typeInfo.label}
                    </Badge>
                    {event.affects_attendance && (
                      <AlertCircle className="h-3 w-3 text-orange-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
