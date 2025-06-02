
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
    try {
      console.log("AuthContext - Fetching user profile for:", userId);
      
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
      
      if (!profile) {
        console.log("AuthContext - Creating new profile");
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
      }
      
      const profileWithCompany: UserProfileData = { ...profile };
      
      if (profile?.company_id) {
        console.log("AuthContext - Fetching company data");
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .maybeSingle();
        
        if (!companyError && companyData) {
          profileWithCompany.companies = companyData;
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
    if (user?.id && !loading) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log("AuthContext - Initializing authentication");
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext - Error getting session:", error);
          if (mounted) {
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await fetchUserProfile(initialSession.user.id);
          }
          
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("AuthContext - Exception during initialization:", error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log("AuthContext - Auth state changed:", event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Defer async operations
          setTimeout(async () => {
            await fetchUserProfile(currentSession.user.id);
            sonnerToast.success('Successfully logged in!', {
              description: 'Welcome back to AdiCorp Management'
            });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          sonnerToast.success('Logged out successfully');
        }
        
        // Update loading state after auth state change
        if (mounted && isInitialized) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthContext - Attempting sign in");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log("AuthContext - Sign in successful");
    } catch (error: any) {
      console.error("AuthContext - Sign in failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      
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
      setLoading(true);
      console.log("AuthContext - Attempting sign out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("AuthContext - Sign out successful");
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
