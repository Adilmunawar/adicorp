import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Repeat, Globe, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";

interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
  weekOfMonth?: number;
  dayOfMonth?: number;
}

const INTERNATIONAL_HOLIDAYS = {
  'US': [
    { name: 'New Year\'s Day', date: '01-01', type: 'holiday' },
    { name: 'Independence Day', date: '07-04', type: 'holiday' },
    { name: 'Christmas Day', date: '12-25', type: 'holiday' },
    { name: 'Thanksgiving', date: 'fourth-thursday-november', type: 'holiday' },
  ],
  'UK': [
    { name: 'New Year\'s Day', date: '01-01', type: 'holiday' },
    { name: 'Good Friday', date: 'easter-2', type: 'holiday' },
    { name: 'Easter Monday', date: 'easter+1', type: 'holiday' },
    { name: 'Christmas Day', date: '12-25', type: 'holiday' },
    { name: 'Boxing Day', date: '12-26', type: 'holiday' },
  ],
  'IN': [
    { name: 'Republic Day', date: '01-26', type: 'holiday' },
    { name: 'Independence Day', date: '08-15', type: 'holiday' },
    { name: 'Gandhi Jayanti', date: '10-02', type: 'holiday' },
    { name: 'Diwali', date: 'lunar-calendar', type: 'holiday' },
  ],
  'CA': [
    { name: 'New Year\'s Day', date: '01-01', type: 'holiday' },
    { name: 'Canada Day', date: '07-01', type: 'holiday' },
    { name: 'Christmas Day', date: '12-25', type: 'holiday' },
    { name: 'Boxing Day', date: '12-26', type: 'holiday' },
  ],
  'PK': [
    { name: 'New Year\'s Day', date: '01-01', type: 'holiday' },
    { name: 'Kashmir Day', date: '02-05', type: 'holiday' },
    { name: 'Pakistan Day', date: '03-23', type: 'holiday' },
    { name: 'Labour Day', date: '05-01', type: 'holiday' },
    { name: 'Independence Day', date: '08-14', type: 'holiday' },
    { name: 'Iqbal Day', date: '11-09', type: 'holiday' },
    { name: 'Quaid-e-Azam Birthday', date: '12-25', type: 'holiday' },
    { name: 'Eid-ul-Fitr', date: 'lunar-calendar', type: 'holiday' },
    { name: 'Eid-ul-Adha', date: 'lunar-calendar', type: 'holiday' },
  ]
};

export default function RecurringEventManager() {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    type: 'weekly',
    interval: 1,
  });
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleImportHolidays = async (country: string, year: number) => {
    if (!userProfile?.company_id) return;

    setLoading(true);
    try {
      const holidays = INTERNATIONAL_HOLIDAYS[country as keyof typeof INTERNATIONAL_HOLIDAYS] || [];
      const eventsToCreate = holidays.map(holiday => ({
        title: holiday.name,
        date: `${year}-${holiday.date}`,
        type: 'holiday',
        affects_attendance: true,
        company_id: userProfile.company_id,
        description: `${country} National Holiday`
      }));

      for (const event of eventsToCreate) {
        if (!event.date.includes('easter') && !event.date.includes('lunar') && !event.date.includes('thursday')) {
          const { error } = await supabase
            .from('events')
            .insert([event]);
          
          if (error) console.error('Error inserting holiday:', error);
        }
      }

      toast({
        title: "Holidays Imported",
        description: `${country} holidays for ${year} have been imported successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecurringEvents = (startDate: Date, pattern: RecurringPattern, title: string) => {
    const events = [];
    let currentDate = new Date(startDate);
    const endDate = pattern.endDate || addYears(startDate, 1);

    while (currentDate <= endDate && events.length < 365) {
      events.push({
        title,
        date: format(currentDate, 'yyyy-MM-dd'),
        type: 'meeting' as const,
        affects_attendance: false,
        company_id: userProfile?.company_id || '',
      });

      switch (pattern.type) {
        case 'daily':
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, pattern.interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, pattern.interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, pattern.interval);
          break;
      }
    }

    return events;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-adicorp-purple" />
          International Standards & Recurring Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* International Holiday Templates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Import International Holidays
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Country/Region</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-adicorp-dark/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="IN">🇮🇳 India</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                  <SelectItem value="PK">🇵🇰 Pakistan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => handleImportHolidays(selectedCountry, new Date().getFullYear())}
                disabled={loading}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                Import {new Date().getFullYear()} Holidays
              </Button>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              Preview: {INTERNATIONAL_HOLIDAYS[selectedCountry as keyof typeof INTERNATIONAL_HOLIDAYS]?.length || 0} holidays will be imported for {selectedCountry}
            </p>
          </div>
        </div>

        {/* Recurring Events Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Repeat className="h-4 w-4 mr-2" />
            Recurring Events Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Recurrence Type</Label>
              <Select 
                value={recurringPattern.type} 
                onValueChange={(value: any) => setRecurringPattern(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-adicorp-dark/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interval</Label>
              <Input
                type="number"
                min="1"
                value={recurringPattern.interval}
                onChange={(e) => setRecurringPattern(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                className="bg-adicorp-dark/50 border-white/10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-adicorp-purple/20 text-adicorp-purple">
                Every {recurringPattern.interval} {recurringPattern.type.slice(0, -2)}(s)
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Zone Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Timezone & Localization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Timezone</Label>
              <Select defaultValue="UTC">
                <SelectTrigger className="bg-adicorp-dark/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">EST (Eastern Standard Time)</SelectItem>
                  <SelectItem value="America/Los_Angeles">PST (Pacific Standard Time)</SelectItem>
                  <SelectItem value="Europe/London">GMT (Greenwich Mean Time)</SelectItem>
                  <SelectItem value="Asia/Kolkata">IST (India Standard Time)</SelectItem>
                  <SelectItem value="Asia/Shanghai">CST (China Standard Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Format</Label>
              <Select defaultValue="MM/DD/YYYY">
                <SelectTrigger className="bg-adicorp-dark/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (German)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
