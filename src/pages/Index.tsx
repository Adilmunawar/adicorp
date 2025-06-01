
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap,
  Star,
  ChevronRight,
  Play,
  CheckCircle
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Easily add, update, and manage employee information with our intuitive interface.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Track daily attendance and generate comprehensive attendance reports with real-time updates.",
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      icon: DollarSign,
      title: "Payroll Management",
      description: "Calculate salaries based on attendance and wage rates in Pakistani Rupees with automatic processing.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Get detailed insights into workforce performance and attendance patterns.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data encryption and reliable cloud infrastructure.",
      color: "text-red-400",
      bgColor: "bg-red-500/20"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with advanced caching and real-time data synchronization.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20"
    }
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      company: "Tech Solutions Ltd",
      content: "AdiCorp transformed our HR processes completely. The automation saved us hours every week.",
      rating: 5
    },
    {
      name: "Fatima Sheikh",
      company: "Green Industries",
      content: "The most user-friendly HR system we've ever used. Highly recommend for Pakistani businesses.",
      rating: 5
    },
    {
      name: "Muhammad Ali",
      company: "Digital Ventures",
      content: "Excellent support and features. The attendance tracking is incredibly accurate.",
      rating: 5
    }
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-adicorp-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-adicorp-purple/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-green-500/20 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className={`px-4 lg:px-6 h-16 flex items-center backdrop-blur-sm bg-adicorp-dark/80 border-b border-white/5 sticky top-0 z-50 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-adicorp-purple to-blue-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <span className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AdiCorp</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center min-h-screen relative">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-8">
            <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-adicorp-purple/20 border border-adicorp-purple/30 backdrop-blur-sm">
                <Star className="w-4 h-4 text-adicorp-purple animate-pulse" />
                <span className="text-sm text-adicorp-purple-light font-medium">Trusted by 1000+ Companies</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white animate-fade-in">
                <span className="bg-gradient-to-r from-white via-adicorp-purple-light to-blue-400 bg-clip-text text-transparent">
                  Manage Your Workforce
                </span>
                <br />
                <span className="bg-gradient-to-r from-adicorp-purple to-purple-400 bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>
              
              <p className="mx-auto max-w-[800px] text-white/70 text-lg md:text-xl leading-relaxed">
                AdiCorp is a comprehensive employee management system designed for small to medium businesses in Pakistan. 
                Experience lightning-fast performance with advanced analytics and seamless automation.
              </p>
            </div>
            
            <div className={`space-y-4 sm:space-y-0 sm:space-x-4 sm:flex transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-adicorp-purple to-purple-600 hover:from-adicorp-purple-dark hover:to-purple-700 btn-glow transform hover:scale-105 transition-all duration-300 shadow-2xl text-lg px-8 py-4 rounded-xl"
                onClick={() => navigate("/auth")}
              >
                <Play className="w-5 h-5 mr-2" />
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => window.open("https://docs.example.com", "_blank")}
              >
                Watch Demo
              </Button>
            </div>

            {/* Floating Stats */}
            <div className={`grid grid-cols-3 gap-8 mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center group">
                <div className="text-3xl font-bold text-adicorp-purple group-hover:scale-110 transition-transform duration-300">1000+</div>
                <div className="text-white/60 text-sm">Active Users</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-white/60 text-sm">Uptime</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-white/60 text-sm">Support</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-adicorp-dark to-adicorp-dark-light relative">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
                <span className="bg-gradient-to-r from-adicorp-purple to-blue-400 bg-clip-text text-transparent">
                  Powerful Features
                </span>
              </h2>
              <p className="mx-auto max-w-[600px] text-white/70 text-lg">
                Everything you need to manage your workforce efficiently and effectively.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:border-adicorp-purple/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${feature.bgColor} bg-opacity-10`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-adicorp-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-block rounded-xl ${feature.bgColor} p-3 mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-adicorp-purple-light transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {hoveredFeature === index && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-5 h-5 text-adicorp-purple" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 bg-adicorp-dark-light relative">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white mb-4">
                What Our Clients Say
              </h2>
              <p className="text-white/70 text-lg">Trusted by businesses across Pakistan</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="glass-card p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-white/80 mb-4 italic">"{testimonial.content}"</p>
                  
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-adicorp-purple text-sm">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-t from-adicorp-dark-light to-adicorp-dark">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to{" "}
                <span className="bg-gradient-to-r from-adicorp-purple to-blue-400 bg-clip-text text-transparent">
                  Transform
                </span>
                {" "}Your Business?
              </h2>
              
              <p className="text-white/70 text-lg md:text-xl leading-relaxed">
                Join thousands of businesses already using AdiCorp to streamline their workforce management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-adicorp-purple to-purple-600 hover:from-adicorp-purple-dark hover:to-purple-700 btn-glow transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl"
                  onClick={() => navigate("/auth")}
                >
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="flex items-center gap-2 text-white/60">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full px-4 md:px-6 border-t border-white/10 bg-adicorp-dark-light/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <p className="text-sm text-white/50">
            © 2025 AdiCorp Management. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-white/60">Proudly developed by</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-adicorp-purple to-blue-400 bg-clip-text text-transparent">
              Adil Munawar
            </span>
            <div className="w-2 h-2 rounded-full bg-adicorp-purple animate-pulse"></div>
          </div>
        </div>
        
        <nav className="flex gap-4 sm:gap-6 justify-center sm:justify-end">
          <a className="text-sm hover:underline underline-offset-4 text-white/50 hover:text-white/80 transition-colors duration-300" href="#">
            Terms of Service
          </a>
          <a className="text-sm hover:underline underline-offset-4 text-white/50 hover:text-white/80 transition-colors duration-300" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
