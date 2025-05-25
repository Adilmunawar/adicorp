
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { ProfileRow, CompanyRow } from "@/types/supabase";

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

  const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
    try {
      console.log("AuthContext - Fetching user profile for:", userId);
      
      // First try to get existing profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("AuthContext - Error fetching profile:", profileError);
        return null;
      }
      
      let profile = profileData;
      
      // If no profile exists, create one
      if (!profile) {
        console.log("AuthContext - No profile found, creating one");
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            is_admin: false
          })
          .select()
          .single();
          
        if (createError) {
          console.error("AuthContext - Error creating profile:", createError);
          return null;
        }
        
        profile = newProfile;
        console.log("AuthContext - New profile created:", profile);
      }
      
      const profileWithCompany: UserProfileData = { ...profile };
      
      // Fetch company data if user has a company_id
      if (profile?.company_id) {
        console.log("AuthContext - Fetching company data for company_id:", profile.company_id);
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .maybeSingle();
        
        if (!companyError && companyData) {
          profileWithCompany.companies = companyData;
          console.log("AuthContext - Company data fetched:", companyData);
        } else if (companyError) {
          console.error("AuthContext - Error fetching company data:", companyError);
        }
      }
      
      setUserProfile(profileWithCompany);
      return profileWithCompany;
    } catch (error) {
      console.error("AuthContext - Exception fetching user profile:", error);
      return null;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user?.id) {
      console.log("AuthContext - Refreshing profile for user:", user.id);
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log("AuthContext - Setting up auth state listener");
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext - Error getting session:", error);
          setLoading(false);
          return;
        }
        
        console.log("AuthContext - Initial session check:", currentSession ? "Session found" : "No session");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("AuthContext - Found existing session, fetching profile");
          await fetchUserProfile(currentSession.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("AuthContext - Exception getting session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("AuthContext - Auth state changed:", event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log("AuthContext - User signed in, fetching profile");
          await fetchUserProfile(currentSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthContext - User signed out");
          setUserProfile(null);
          sonnerToast.success('Logged out successfully');
        }
        
        if (!currentSession) {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext - Attempting sign in for:", email);
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("AuthContext - Attempting sign up for:", email);
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext - Signing out");
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("AuthContext - Sign out failed:", error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
