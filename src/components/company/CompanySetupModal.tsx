
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Loader2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  address: z.string().optional(),
  logo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanySetupModal() {
  const { toast } = useToast();
  const { user, userProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      website: "",
      address: "",
      logo: ""
    }
  });

  useEffect(() => {
    console.log("CompanySetupModal - Checking setup needed:", { 
      user: !!user, 
      userProfile: !!userProfile, 
      company_id: userProfile?.company_id 
    });
    
    if (user && userProfile !== null && !userProfile.company_id) {
      console.log("CompanySetupModal - Opening modal for company setup");
      setIsOpen(true);
    } else {
      console.log("CompanySetupModal - No setup needed");
      setIsOpen(false);
    }
  }, [user, userProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      console.log("CompanySetupModal - Creating company:", values);
      
      let logoUrl = null;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        console.log("CompanySetupModal - Uploading logo to:", filePath);
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile);
          
        if (uploadError) {
          console.error("CompanySetupModal - Logo upload error:", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
        console.log("CompanySetupModal - Logo uploaded:", logoUrl);
      }
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: values.name,
          phone: values.phone || null,
          website: values.website || null,
          address: values.address || null,
          logo: logoUrl
        })
        .select()
        .single();
        
      if (companyError) {
        console.error("CompanySetupModal - Company creation error:", companyError);
        throw companyError;
      }
      
      console.log("CompanySetupModal - Company created:", companyData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: companyData.id,
          is_admin: true 
        })
        .eq('id', user.id);
        
      if (profileError) {
        console.error("CompanySetupModal - Profile update error:", profileError);
        throw profileError;
      }
      
      console.log("CompanySetupModal - Profile updated successfully");
      
      await refreshProfile();
      
      sonnerToast.success("Company setup complete", {
        description: "Your company has been successfully configured."
      });
      
      setIsOpen(false);
      
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("CompanySetupModal - Error setting up company:", error);
      toast({
        title: "Failed to setup company",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (userProfile && userProfile.company_id) {
        setIsOpen(open);
      }
    }}>
      <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-adicorp-purple" />
            Setup Your Company
          </DialogTitle>
          <DialogDescription>
            Enter your company details to get started with AdiCorp HR Management.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. Acme Corporation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. +1 (555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. https://www.example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-adicorp-dark/60 border-white/10"
                      placeholder="e.g. 123 Main Street, City, Country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center space-x-3">
                {logoPreview ? (
                  <div className="relative w-12 h-12 rounded bg-white/10 overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded bg-adicorp-dark/60 border border-white/10">
                    <Building className="h-6 w-6 text-white/50" />
                  </div>
                )}
                <div>
                  <label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer px-4 py-2 rounded text-sm bg-adicorp-dark/80 hover:bg-adicorp-dark/60 border border-white/10 flex items-center"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </label>
                  <input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-white/50 mt-1">Optional. PNG or JPG recommended</p>
                </div>
              </div>
            </div>
          
            <DialogFooter className="pt-4">
              <Button 
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
