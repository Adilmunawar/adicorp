
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Clock, Calendar } from "lucide-react";

interface CompanyWorkingSettings {
  company_id: string;
  default_working_days_per_week: number;
  default_working_days_per_month: number;
  salary_divisor: number;
  weekend_saturday: boolean;
  weekend_sunday: boolean;
}

export default function CompanyWorkingSettings() {
  const [settings, setSettings] = useState<CompanyWorkingSettings>({
    company_id: '',
    default_working_days_per_week: 5,
    default_working_days_per_month: 22,
    salary_divisor: 26,
    weekend_saturday: false,
    weekend_sunday: true,
  });
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSettings();
    }
  }, [userProfile?.company_id]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_working_settings')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        setSettings(prev => ({ ...prev, company_id: userProfile?.company_id || '' }));
      }
    } catch (error) {
      console.error("Error fetching company working settings:", error);
    }
  };

  const handleWorkingDaysChange = (value: string) => {
    const workingDays = parseInt(value);
    setSettings(prev => ({
      ...prev,
      default_working_days_per_week: workingDays,
      default_working_days_per_month: workingDays === 5 ? 22 : 26,
      weekend_saturday: workingDays === 6,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!userProfile?.company_id) return;

      const { error } = await supabase
        .from('company_working_settings')
        .upsert({
          company_id: userProfile.company_id,
          default_working_days_per_week: settings.default_working_days_per_week,
          default_working_days_per_month: settings.default_working_days_per_month,
          salary_divisor: settings.salary_divisor,
          weekend_saturday: settings.weekend_saturday,
          weekend_sunday: settings.weekend_sunday,
        }, {
          onConflict: 'company_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Company working settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save company working settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-adicorp-purple" />
          Company Working Days Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Working Days Per Week</Label>
              <Select 
                value={settings.default_working_days_per_week.toString()}
                onValueChange={handleWorkingDaysChange}
              >
                <SelectTrigger className="bg-adicorp-dark border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Days (Mon-Fri)</SelectItem>
                  <SelectItem value="6">6 Days (Mon-Sat)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="saturday" className="text-sm">Saturday as Working Day</Label>
              <Switch
                id="saturday"
                checked={settings.weekend_saturday}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    weekend_saturday: checked,
                    default_working_days_per_week: checked ? 6 : 5,
                    default_working_days_per_month: checked ? 26 : 22,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sunday" className="text-sm">Sunday as Off Day</Label>
              <Switch
                id="sunday"
                checked={settings.weekend_sunday}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, weekend_sunday: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-adicorp-dark/30 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-adicorp-purple" />
                <span className="font-medium">Monthly Summary</span>
              </div>
              <p className="text-sm text-white/70 mb-2">
                Working Days per Month: <span className="text-white font-medium">{settings.default_working_days_per_month}</span>
              </p>
              <p className="text-sm text-white/70">
                Daily Rate Calculation: <span className="text-white font-medium">Salary ÷ {settings.salary_divisor}</span>
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-blue-400">Important Note</span>
              </div>
              <p className="text-xs text-blue-300">
                Daily rate is always calculated by dividing salary by 26, regardless of actual working days. 
                This ensures consistent salary calculations across different months.
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/10">
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
