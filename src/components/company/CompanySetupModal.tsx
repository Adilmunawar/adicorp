
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Loader2, Upload, Edit } from "lucide-react";
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
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanySetupModal() {
  const { toast } = useToast();
  const { user, userProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
    }
  });

  useEffect(() => {
    if (user && userProfile !== null) {
      if (!userProfile.company_id) {
        // New company setup
        setIsEditMode(false);
        setIsOpen(true);
      } else if (userProfile.companies) {
        // Load existing company data for editing
        const company = userProfile.companies;
        form.reset({
          name: company.name || "",
          phone: company.phone || "",
          website: company.website || "",
          address: company.address || "",
        });
        if (company.logo) {
          setLogoPreview(company.logo);
        }
      }
    }
  }, [user, userProfile, form]);

  const openEditMode = () => {
    if (userProfile?.companies) {
      const company = userProfile.companies;
      form.reset({
        name: company.name || "",
        phone: company.phone || "",
        website: company.website || "",
        address: company.address || "",
      });
      if (company.logo) {
        setLogoPreview(company.logo);
      }
      setIsEditMode(true);
      setIsOpen(true);
    }
  };

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let logoUrl = logoPreview;
      
      // Upload new logo if provided
      if (logoFile) {
        try {
          const fileExt = logoFile.name.split('.').pop();
          const filePath = `${user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('logos')
            .upload(filePath, logoFile);
            
          if (uploadError) {
            throw new Error(`Logo upload failed: ${uploadError.message}`);
          }
          
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('logos')
              .getPublicUrl(filePath);
              
            logoUrl = publicUrl;
          }
        } catch (logoError) {
          console.error("Logo upload failed:", logoError);
          toast({
            title: "Logo upload failed",
            description: "Company will be saved without logo.",
            variant: "destructive",
          });
        }
      }
      
      if (isEditMode && userProfile?.company_id) {
        // Update existing company
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: values.name,
            phone: values.phone || null,
            website: values.website || null,
            address: values.address || null,
            logo: logoUrl
          })
          .eq('id', userProfile.company_id);
          
        if (companyError) {
          throw new Error(`Company update failed: ${companyError.message}`);
        }
        
        sonnerToast.success("Company updated successfully", {
          description: "Your company details have been updated."
        });
      } else {
        // Create new company
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
          throw new Error(`Company creation failed: ${companyError.message}`);
        }
        
        // Update user profile with company_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            company_id: companyData.id,
            is_admin: true 
          })
          .eq('id', user.id);
          
        if (profileError) {
          throw new Error(`Profile update failed: ${profileError.message}`);
        }
        
        sonnerToast.success("Company setup complete", {
          description: "Your company has been successfully configured."
        });
        
        if (location.pathname !== "/dashboard") {
          navigate("/dashboard", { replace: true });
        }
      }
      
      // Refresh profile data
      await refreshProfile();
      setIsOpen(false);
      
    } catch (error: any) {
      console.error("Error with company:", error);
      toast({
        title: isEditMode ? "Failed to update company" : "Failed to setup company",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <>
      {/* Show edit button if company exists */}
      {userProfile?.company_id && !isOpen && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Company Information</h3>
              <p className="text-white/70">Manage your company details and settings</p>
            </div>
            <Button 
              onClick={openEditMode}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Company
            </Button>
          </div>
          
          {userProfile.companies && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                {userProfile.companies.logo && (
                  <img 
                    src={userProfile.companies.logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-white">{userProfile.companies.name}</p>
                  <p className="text-sm text-white/70">Company Name</p>
                </div>
              </div>
              
              {userProfile.companies.phone && (
                <div>
                  <p className="font-medium text-white">{userProfile.companies.phone}</p>
                  <p className="text-sm text-white/70">Phone Number</p>
                </div>
              )}
              
              {userProfile.companies.website && (
                <div>
                  <p className="font-medium text-white">{userProfile.companies.website}</p>
                  <p className="text-sm text-white/70">Website</p>
                </div>
              )}
              
              {userProfile.companies.address && (
                <div>
                  <p className="font-medium text-white">{userProfile.companies.address}</p>
                  <p className="text-sm text-white/70">Address</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          // Only allow closing if user already has a company or in edit mode
          if (!open && (userProfile?.company_id || isEditMode)) {
            setIsOpen(false);
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent className="glass-card bg-adicorp-dark-light border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-adicorp-purple" />
              {isEditMode ? "Edit Company Details" : "Setup Your Company"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update your company information and settings." 
                : "Enter your company details to get started with AdiCorp HR Management."
              }
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                      className={`cursor-pointer px-4 py-2 rounded text-sm bg-adicorp-dark/80 hover:bg-adicorp-dark/60 border border-white/10 flex items-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
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
                      disabled={isLoading}
                    />
                    <p className="text-xs text-white/50 mt-1">Optional. PNG or JPG recommended</p>
                  </div>
                </div>
              </div>
            
              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isLoading || !form.formState.isValid}
                  className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Setting Up..."}
                    </>
                  ) : (
                    isEditMode ? "Update Company" : "Complete Setup"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
