
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  isOvernight: boolean;
  color: string;
  isActive: boolean;
}

interface ShiftAssignment {
  employeeId: string;
  shiftId: string;
  effectiveDate: Date;
  endDate?: Date;
}

const PRESET_SHIFTS = [
  { name: 'Day Shift', startTime: '09:00', endTime: '17:00', breakDuration: 60, color: '#3B82F6' },
  { name: 'Evening Shift', startTime: '17:00', endTime: '01:00', breakDuration: 60, color: '#F59E0B', isOvernight: true },
  { name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakDuration: 45, color: '#6366F1', isOvernight: true },
  { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakDuration: 45, color: '#10B981' },
  { name: 'Split Shift', startTime: '08:00', endTime: '12:00', breakDuration: 30, color: '#8B5CF6' },
];

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    isOvernight: false,
    color: '#3B82F6',
  });
  const { toast } = useToast();

  const calculateShiftHours = (startTime: string, endTime: string, isOvernight: boolean, breakDuration: number) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let totalMinutes = 0;
    
    if (isOvernight) {
      // Calculate overnight shift
      const minutesUntilMidnight = (24 * 60) - (startHour * 60 + startMin);
      const minutesFromMidnight = endHour * 60 + endMin;
      totalMinutes = minutesUntilMidnight + minutesFromMidnight;
    } else {
      totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }
    
    // Subtract break time
    totalMinutes -= breakDuration;
    
    return (totalMinutes / 60).toFixed(1);
  };

  const handleCreateShift = () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
    };

    if (editingShift) {
      setShifts(prev => prev.map(shift => 
        shift.id === editingShift.id ? { ...newShift, id: editingShift.id } : shift
      ));
      toast({ title: "Shift updated successfully!" });
    } else {
      setShifts(prev => [...prev, newShift]);
      toast({ title: "Shift created successfully!" });
    }

    resetForm();
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    toast({ title: "Shift deleted successfully!" });
  };

  const handleEditShift = (shift: Shift) => {
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      isOvernight: shift.isOvernight,
      color: shift.color,
    });
    setEditingShift(shift);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      isOvernight: false,
      color: '#3B82F6',
    });
    setEditingShift(null);
    setShowForm(false);
  };

  const loadPresetShifts = () => {
    const presetShifts: Shift[] = PRESET_SHIFTS.map((preset, index) => ({
      id: `preset-${index}`,
      ...preset,
      isOvernight: preset.isOvernight || false,
      isActive: true,
    }));
    
    setShifts(presetShifts);
    toast({ title: "Preset shifts loaded successfully!" });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-adicorp-purple" />
            Shift Management
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={loadPresetShifts}
              variant="outline"
              className="border-white/10 hover:bg-adicorp-dark"
            >
              Load Presets
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Shift'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shift Creation Form */}
        {showForm && (
          <div className="space-y-4 p-4 bg-adicorp-dark/30 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Shift Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10"
                  placeholder="e.g., Morning Shift"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10 h-10"
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="bg-adicorp-dark/50 border-white/10"
                />
              </div>
              <div>
                <Label>Break Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                  className="bg-adicorp-dark/50 border-white/10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isOvernight}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOvernight: checked }))}
                />
                <Label>Overnight Shift</Label>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateShift}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
              >
                {editingShift ? 'Update Shift' : 'Create Shift'}
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="border-white/10 hover:bg-adicorp-dark"
              >
                Cancel
              </Button>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                Working Hours: {calculateShiftHours(formData.startTime, formData.endTime, formData.isOvernight, formData.breakDuration)} hours
                {formData.isOvernight && ' (Overnight)'}
              </p>
            </div>
          </div>
        )}

        {/* Shifts List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Configured Shifts</h3>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No shifts configured. Create your first shift above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="p-4 bg-adicorp-dark/20 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: shift.color }}
                      />
                      <span className="font-medium">{shift.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditShift(shift)}
                        className="border-white/10 hover:bg-adicorp-dark"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteShift(shift.id)}
                        className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-white/70">
                    <p>⏰ {shift.startTime} - {shift.endTime}</p>
                    <p>☕ Break: {shift.breakDuration} minutes</p>
                    <p>⚡ Hours: {calculateShiftHours(shift.startTime, shift.endTime, shift.isOvernight, shift.breakDuration)}</p>
                    {shift.isOvernight && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                        Overnight
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
