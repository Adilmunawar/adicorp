
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock company data (will be replaced with real data from Supabase)
const mockCompanies = [
  { id: "1", name: "TechCorp Inc." },
  { id: "2", name: "Global Systems" },
  { id: "3", name: "Nexus Enterprises" },
];

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [createCompany, setCreateCompany] = useState(true);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    companyId: "",
    companyLogo: "",
    companyPhone: "",
    companyWebsite: "",
    companyAddress: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd handle auth with Supabase here
    console.log("Form data:", formData);
    
    // For now, just redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-md">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Enter your credentials to access AdiCorp" 
              : "Set up your account to get started"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue={isAdmin ? "admin" : "employee"} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" onClick={() => setIsAdmin(true)}>
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" onClick={() => setIsAdmin(false)}>
                  Employee
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-adicorp-dark-light/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-adicorp-dark-light/50 border-white/10"
                />
              </div>
              
              {!isLogin && isAdmin && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Tabs 
                      defaultValue={createCompany ? "create" : "existing"}
                      className="w-full"
                      onValueChange={(val) => setCreateCompany(val === "create")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Create New</TabsTrigger>
                        <TabsTrigger value="existing">Join Existing</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="create" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="bg-adicorp-dark-light/50 border-white/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone">Phone Number</Label>
                          <Input
                            id="companyPhone"
                            name="companyPhone"
                            value={formData.companyPhone}
                            onChange={handleInputChange}
                            className="bg-adicorp-dark-light/50 border-white/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite">Website</Label>
                          <Input
                            id="companyWebsite"
                            name="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={handleInputChange}
                            className="bg-adicorp-dark-light/50 border-white/10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyAddress">Address</Label>
                          <Input
                            id="companyAddress"
                            name="companyAddress"
                            value={formData.companyAddress}
                            onChange={handleInputChange}
                            className="bg-adicorp-dark-light/50 border-white/10"
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="existing" className="mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="existingCompany">Select Company</Label>
                          <Select
                            onValueChange={(value) => 
                              setFormData(prev => ({ ...prev, companyId: value }))
                            }
                          >
                            <SelectTrigger className="bg-adicorp-dark-light/50 border-white/10">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {mockCompanies.map((company) => (
                                  <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-adicorp-purple hover:bg-adicorp-purple-dark transition-colors btn-glow"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="text-center flex justify-center border-t border-white/5 pt-4">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-adicorp-purple hover:text-adicorp-purple-light transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
