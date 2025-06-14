
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Check, AlertCircle } from "lucide-react";
import { WorkingDayConfig } from "@/types/events";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchConfig();
    }
  }, [userProfile?.company_id]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('working_days_config')
        .select('*')
        .eq('company_id', userProfile?.company_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig(data);
      } else {
        setConfig(prev => ({ ...prev, company_id: userProfile?.company_id || '' }));
      }
    } catch (error) {
      console.error("Error fetching working days config:", error);
      toast({
        title: "Error",
        description: "Failed to load working days configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: keyof WorkingDayConfig, checked: boolean) => {
    setConfig(prev => ({ ...prev, [day]: checked }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
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

      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Working days configuration has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save working days configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
  ];

  const selectedDaysCount = days.filter(day => 
    config[day.key as keyof WorkingDayConfig] as boolean
  ).length;

  if (loading) {
    return <LoadingSkeleton type="form" count={3} />;
  }

  return (
    <ResponsiveContainer>
      <Card className="glass-card transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Settings className="h-5 w-5 text-adicorp-purple" />
            Working Days Configuration
          </CardTitle>
          <p className="text-white/70 text-sm">
            Configure which days are considered working days for your company.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-adicorp-purple/10 border border-adicorp-purple/20">
            <AlertCircle className="h-4 w-4 text-adicorp-purple" />
            <span className="text-sm text-white/80">
              {selectedDaysCount} working {selectedDaysCount === 1 ? 'day' : 'days'} per week selected
            </span>
          </div>

          {/* Days Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {days.map((day) => {
              const isChecked = config[day.key as keyof WorkingDayConfig] as boolean;
              return (
                <div 
                  key={day.key} 
                  className={`
                    flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all duration-200
                    ${isChecked 
                      ? 'bg-adicorp-purple/20 border-adicorp-purple/40' 
                      : 'bg-adicorp-dark/30 border-white/10'
                    }
                    hover:border-adicorp-purple/60
                  `}
                >
                  <Switch
                    id={day.key}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleDayChange(day.key as keyof WorkingDayConfig, checked)}
                    aria-label={`Toggle ${day.label} as working day`}
                    className="data-[state=checked]:bg-adicorp-purple"
                  />
                  <Label 
                    htmlFor={day.key} 
                    className="text-xs sm:text-sm font-medium text-center cursor-pointer select-none"
                  >
                    <span className="block sm:hidden">{day.shortLabel}</span>
                    <span className="hidden sm:block">{day.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-400">Important Notes:</p>
                <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                  <li>Employees will only appear in attendance for configured working days</li>
                  <li>Salary calculations will be based on selected working days</li>
                  <li>Changes take effect immediately after saving</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <Button 
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark disabled:opacity-50 flex-1 sm:flex-none"
              aria-label="Save working days configuration"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
            
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={() => {
                  fetchConfig();
                  setHasChanges(false);
                }}
                className="border-white/20 hover:bg-white/10"
              >
                Reset Changes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}
