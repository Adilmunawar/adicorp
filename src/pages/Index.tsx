import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import TestimonialsCarousel from "@/components/ui/testimonials-carousel";
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
  CheckCircle,
  Sparkles,
  ArrowRight,
  Code,
  Heart,
  Globe,
  Award,
  Target,
  Rocket,
  Database,
  BarChart3,
  Lock
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 0,
      maxLife: Math.random() * 100 + 50
    });

    const particleArray: Particle[] = Array.from({ length: 50 }, createParticle);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particleArray.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.life > particle.maxLife || 
            particle.x < 0 || particle.x > canvas.width ||
            particle.y < 0 || particle.y > canvas.height) {
          particleArray[index] = createParticle();
        }

        const opacity = 1 - particle.life / particle.maxLife;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, 2
        );
        gradient.addColorStop(0, `rgba(155, 135, 245, ${opacity})`);
        gradient.addColorStop(1, `rgba(155, 135, 245, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Easily add, update, and manage employee information with our intuitive interface and advanced search capabilities.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Track daily attendance and generate comprehensive attendance reports with real-time updates and automated notifications.",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      gradient: "from-green-400 to-emerald-400"
    },
    {
      icon: DollarSign,
      title: "Payroll Management",
      description: "Calculate salaries based on attendance and wage rates in Pakistani Rupees with automatic processing and tax calculations.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      gradient: "from-yellow-400 to-orange-400"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights into workforce performance, attendance patterns, and productivity metrics with interactive dashboards.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data encryption, reliable cloud infrastructure, and compliance with industry standards.",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      gradient: "from-red-400 to-rose-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with advanced caching, real-time data synchronization, and lightning-fast response times.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      gradient: "from-cyan-400 to-blue-400"
    },
    {
      icon: Database,
      title: "Smart Data Management",
      description: "Intelligent data organization with automated backups, version control, and seamless data migration capabilities.",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      gradient: "from-indigo-400 to-purple-400"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor employee goals, track performance metrics, and achieve organizational objectives efficiently.",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      gradient: "from-orange-400 to-red-400"
    },
    {
      icon: Lock,
      title: "Privacy Protection",
      description: "Advanced privacy controls with role-based access, data anonymization, and GDPR compliance for maximum security.",
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
      gradient: "from-pink-400 to-rose-400"
    }
  ];

  const stats = [
    { value: "2500+", label: "Active Users", color: "text-adicorp-purple", icon: Users },
    { value: "99.9%", label: "Uptime", color: "text-green-400", icon: TrendingUp },
    { value: "24/7", label: "Support", color: "text-blue-400", icon: Shield },
    { value: "150+", label: "Companies", color: "text-yellow-400", icon: Award },
    { value: "50M+", label: "Records", color: "text-purple-400", icon: Database },
    { value: "<1s", label: "Load Time", color: "text-cyan-400", icon: Rocket }
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-adicorp-dark relative overflow-hidden">
      {/* Enhanced Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ opacity: 0.7 }}
      />

      {/* Enhanced Mouse Follower */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-adicorp-purple to-blue-500 rounded-full pointer-events-none z-50 transition-all duration-200 ease-out blur-sm"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${hoveredFeature !== null ? 1.5 : 1})`,
          opacity: hoveredFeature !== null ? 0.8 : 0.4
        }}
      />

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-adicorp-purple/40 to-blue-500/40 blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/40 to-green-500/40 blur-3xl animate-pulse"
          style={{ animationDelay: '1s', transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-gradient-to-r from-green-500/40 to-purple-500/40 blur-2xl animate-pulse"
          style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.15}px)` }}
        />
        
        {/* Enhanced Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 border-2 border-adicorp-purple/30 rotate-45 animate-spin-slow hover:border-adicorp-purple/60 transition-colors duration-500"></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-20 border-2 border-blue-400/30 rounded-full animate-bounce-slow hover:border-blue-400/60 transition-colors duration-500"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-adicorp-purple/20 to-transparent rotate-12 animate-pulse hover:from-adicorp-purple/40 transition-all duration-500"></div>
        <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-lg animate-float"></div>
      </div>

      <header className={`px-4 lg:px-6 h-16 flex items-center backdrop-blur-sm bg-adicorp-dark/90 border-b border-white/10 sticky top-0 z-50 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-adicorp-purple via-blue-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-adicorp-purple/50">
            <span className="text-white font-bold text-lg relative z-10">AC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold text-white bg-gradient-to-r from-white via-adicorp-purple-light to-blue-400 bg-clip-text text-transparent">
            AdiCorp
          </span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            onClick={() => navigate("/auth")}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/0 via-adicorp-purple/20 to-adicorp-purple/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Enhanced Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center min-h-screen relative">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-8">
            <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-adicorp-purple/20 via-blue-500/20 to-purple-600/20 border border-adicorp-purple/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Star className="w-4 h-4 text-adicorp-purple animate-pulse" />
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="text-sm text-adicorp-purple-light font-medium">Trusted by 2500+ Companies Worldwide</span>
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white animate-fade-in relative">
                <span className="bg-gradient-to-r from-white via-adicorp-purple-light to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                  Transform Your Workforce
                </span>
                <br />
                <span className="bg-gradient-to-r from-adicorp-purple via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x" style={{ animationDelay: '0.5s' }}>
                  Management Experience
                </span>
                <div className="absolute -inset-4 bg-gradient-to-r from-adicorp-purple/20 via-transparent to-blue-500/20 blur-2xl -z-10 animate-pulse"></div>
              </h1>
              
              <p className="mx-auto max-w-[800px] text-white/70 text-lg md:text-xl leading-relaxed hover:text-white/90 transition-colors duration-300">
                AdiCorp is the next-generation employee management system designed for modern businesses in Pakistan. 
                Experience <span className="text-adicorp-purple font-semibold">unparalleled performance</span> with AI-powered analytics, 
                seamless automation, and enterprise-grade security.
              </p>
            </div>
            
            <div className={`space-y-4 sm:space-y-0 sm:space-x-4 sm:flex transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-adicorp-purple via-purple-600 to-blue-600 hover:from-adicorp-purple-dark hover:via-purple-700 hover:to-blue-700 btn-glow transform hover:scale-110 transition-all duration-300 shadow-2xl text-lg px-8 py-4 rounded-xl relative overflow-hidden group"
                onClick={() => navigate("/auth")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Play className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Start Free Trial</span>
                <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                onClick={() => window.open("https://docs.example.com", "_blank")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/0 via-adicorp-purple/10 to-adicorp-purple/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <span className="relative z-10">Watch Demo</span>
              </Button>
            </div>

            {/* Enhanced Floating Stats Grid */}
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <div className="relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-adicorp-purple/50 transition-all duration-300">
                    <div className={`text-2xl md:text-3xl font-bold ${stat.color} group-hover:scale-125 transition-all duration-300 relative z-10`}>
                      {stat.value}
                    </div>
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mt-2 opacity-50 group-hover:opacity-100 transition-all duration-300`} />
                    <div className="text-white/60 text-xs md:text-sm mt-1 group-hover:text-white/80 transition-colors duration-300">
                      {stat.label}
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.replace('text-', 'from-')}/10 to-transparent rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced Features Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-adicorp-dark via-adicorp-dark-light to-adicorp-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/5 via-transparent to-blue-500/5"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4 relative">
                <span className="bg-gradient-to-r from-adicorp-purple via-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                  Powerful Features & Capabilities
                </span>
                <div className="absolute -inset-2 bg-gradient-to-r from-adicorp-purple/10 via-transparent to-blue-500/10 blur-xl -z-10"></div>
              </h2>
              <p className="mx-auto max-w-[600px] text-white/70 text-lg">
                Everything you need to manage your workforce efficiently, effectively, and intelligently.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:border-adicorp-purple/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${feature.bgColor} bg-opacity-10 cursor-pointer`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: `translateY(${scrollY * 0.05}px)`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-block rounded-xl ${feature.bgColor} p-3 mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}>
                      <feature.icon className={`h-6 w-6 ${feature.color} relative z-10`} />
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-adicorp-purple-light transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 text-adicorp-purple" />
                  </div>
                  
                  {hoveredFeature === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/10 via-transparent to-blue-500/10 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section with Carousel */}
        <section className="w-full py-16 md:py-24 bg-adicorp-dark-light relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(155,135,245,0.1),transparent_50%)]"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white mb-4">
                What Our <span className="bg-gradient-to-r from-adicorp-purple to-blue-400 bg-clip-text text-transparent">Clients Say</span>
              </h2>
              <p className="text-white/70 text-lg">Trusted by businesses across Pakistan and beyond</p>
            </div>
            
            <TestimonialsCarousel />
          </div>
        </section>
        
        {/* Enhanced CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-t from-adicorp-dark-light to-adicorp-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,135,245,0.1),transparent_70%)]"></div>
          
          <div className="container px-4 md:px-6 text-center relative z-10">
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to{" "}
                <span className="bg-gradient-to-r from-adicorp-purple via-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                  Transform
                </span>
                {" "}Your Business?
              </h2>
              
              <p className="text-white/70 text-lg md:text-xl leading-relaxed">
                Join thousands of businesses already using AdiCorp to streamline their workforce management 
                and accelerate their growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-adicorp-purple via-purple-600 to-blue-600 hover:from-adicorp-purple-dark hover:via-purple-700 hover:to-blue-700 btn-glow transform hover:scale-110 transition-all duration-300 text-lg px-8 py-4 rounded-xl relative overflow-hidden group"
                  onClick={() => navigate("/auth")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Start Free Trial</span>
                  <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                <div className="flex items-center gap-2 text-white/60 group">
                  <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-white/80 transition-colors duration-300">No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full px-4 md:px-6 border-t border-white/10 bg-adicorp-dark-light/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/5 via-transparent to-blue-500/5"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full relative z-10">
          <p className="text-sm text-white/50">
            © 2025 AdiCorp Management. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3 sm:ml-auto group">
            <Code className="w-4 h-4 text-adicorp-purple animate-pulse" />
            <span className="text-sm text-white/60">Proudly developed with</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span className="text-sm text-white/60">by</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-adicorp-purple via-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              Adil Munawar
            </span>
            <Globe className="w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="w-2 h-2 rounded-full bg-adicorp-purple animate-pulse"></div>
          </div>
        </div>
        
        <nav className="flex gap-4 sm:gap-6 justify-center sm:justify-end relative z-10">
          <a className="text-sm hover:underline underline-offset-4 text-white/50 hover:text-white/80 transition-all duration-300 transform hover:scale-105" href="#">
            Terms of Service
          </a>
          <a className="text-sm hover:underline underline-offset-4 text-white/50 hover:text-white/80 transition-all duration-300 transform hover:scale-105" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
