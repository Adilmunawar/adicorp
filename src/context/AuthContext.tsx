import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { ProfileRow, CompanyRow } from "@/types/supabase";

// Define a type that extends the ProfileRow with an optional companies property
type UserProfileData = ProfileRow & {
  companies?: CompanyRow | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userProfile: UserProfileData | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("AuthContext - Fetching user profile for:", userId);
      
      // First get the basic profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found, this could be a new user
          console.log("AuthContext - No profile found, creating one");
          
          // Create a new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ id: userId })
            .select()
            .single();
            
          if (createError) {
            console.error("AuthContext - Error creating new profile:", createError);
            return null;
          }
          
          console.log("AuthContext - New profile created:", newProfile);
          setUserProfile(newProfile);
          return newProfile;
        }
        
        console.error("AuthContext - Error fetching user profile:", profileError);
        return null;
      }
      
      console.log("AuthContext - User profile fetched successfully:", profileData);
      
      // Create our extended profile data object
      const profileDataWithCompany: UserProfileData = { ...profileData };
      
      // If we have a company_id, fetch the company details separately
      if (profileData && profileData.company_id) {
        console.log("AuthContext - Fetching company data for company_id:", profileData.company_id);
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();
        
        if (!companyError && companyData) {
          // Add company data to our profile object
          profileDataWithCompany.companies = companyData;
          console.log("AuthContext - Company data fetched:", companyData);
        } else if (companyError) {
          console.error("AuthContext - Error fetching company data:", companyError);
        }
      } else {
        console.log("AuthContext - User has no company_id, skipping company fetch");
      }
      
      setUserProfile(profileDataWithCompany);
      return profileDataWithCompany;
    } catch (error) {
      console.error("AuthContext - Exception fetching user profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log("AuthContext - Refreshing profile for user:", user.id);
      await fetchUserProfile(user.id);
      return; // Making sure we explicitly return void
    } else {
      console.log("AuthContext - Cannot refresh profile, no user ID available");
      return; // Making sure we explicitly return void
    }
  };

  useEffect(() => {
    console.log("AuthContext - Setting up auth state listener");
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("AuthContext - Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle user profile fetching with setTimeout to avoid recursion
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log("AuthContext - User signed in, fetching profile");
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          sonnerToast.success('Logged out successfully');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("AuthContext - Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log("AuthContext - Found existing session, fetching profile");
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error("AuthContext - Error getting session:", error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext - Attempting sign in for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("AuthContext - Sign in successful");
    } catch (error: any) {
      console.error("AuthContext - Sign in failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("AuthContext - Attempting sign up for:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      console.log("AuthContext - Sign up successful");
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error("AuthContext - Sign up failed:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext - Signing out");
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("AuthContext - Sign out failed:", error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        userProfile,
        refreshProfile,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
