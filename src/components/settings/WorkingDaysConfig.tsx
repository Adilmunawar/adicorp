import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from "lucide-react";
import { WorkingDayConfig } from "@/types/events";

export default function WorkingDaysConfig() {
  const [config, setConfig] = useState<WorkingDayConfig>({
    company_id: '',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchConfig();
    }
  }, [userProfile?.company_id]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('working_days_config')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig(data);
      } else {
        // Set default config
        setConfig(prev => ({ ...prev, company_id: userProfile?.company_id || '' }));
      }
    } catch (error) {
      console.error("Error fetching working days config:", error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!userProfile?.company_id) return;

      const { error } = await supabase
        .from('working_days_config')
        .upsert({
          company_id: userProfile.company_id,
          monday: config.monday,
          tuesday: config.tuesday,
          wednesday: config.wednesday,
          thursday: config.thursday,
          friday: config.friday,
          saturday: config.saturday,
          sunday: config.sunday,
        }, {
          onConflict: 'company_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Working days configuration has been updated.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save working days configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-adicorp-purple" />
          Working Days Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center space-x-2">
              <Switch
                id={day.key}
                checked={config[day.key as keyof WorkingDayConfig] as boolean}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, [day.key]: checked }))
                }
              />
              <Label htmlFor={day.key} className="text-sm">
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <p className="text-white/70 text-sm mb-4">
            Configure which days are considered working days for your company. 
            Employees will only appear in attendance for configured working days.
          </p>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
