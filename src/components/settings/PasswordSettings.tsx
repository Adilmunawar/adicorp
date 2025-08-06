
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export default function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const validatePassword = () => {
    const validationErrors: string[] = [];
    
    if (newPassword.length < 6) {
      validationErrors.push("Password must be at least 6 characters long");
    }
    
    if (newPassword !== confirmPassword) {
      validationErrors.push("New password and confirmation password don't match");
    }
    
    if (!newPassword) {
      validationErrors.push("New password is required");
    }
    
    if (!confirmPassword) {
      validationErrors.push("Password confirmation is required");
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      setSuccess(false);
      setErrors([]);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Log the password change activity
      await logActivity({
        actionType: 'password_change',
        description: 'User changed their password',
        details: {
          timestamp: new Date().toISOString(),
          priority: 'high'
        }
      });

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage = error.message || "Failed to update password. Please try again.";
      setErrors([errorMessage]);
      
      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-adicorp-purple/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-adicorp-purple" />
          </div>
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Password updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {errors.length > 0 && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white/90">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors([]);
                }}
                className="bg-adicorp-dark/60 border-white/10 focus:border-adicorp-purple transition-colors pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-white/60" />
                ) : (
                  <Eye className="h-4 w-4 text-white/60" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/90">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors([]);
                }}
                className="bg-adicorp-dark/60 border-white/10 focus:border-adicorp-purple transition-colors pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-white/60" />
                ) : (
                  <Eye className="h-4 w-4 text-white/60" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-adicorp-dark/30 rounded-lg border border-white/10">
          <h4 className="font-semibold text-sm mb-2 text-white">Password Requirements:</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Minimum 6 characters long</li>
            <li>• New password and confirmation must match</li>
            <li>• Use a strong, unique password</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
