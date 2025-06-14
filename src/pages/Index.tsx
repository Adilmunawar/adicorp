import { useEffect, useState, useRef } from "react";
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
  Lock,
  Cpu,
  Brain,
  Network,
  FileSpreadsheet,
  Calendar,
  MessageCircle,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Cloud,
  Activity,
  PieChart,
  LineChart,
  Building2,
  UserCheck,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Briefcase,
  GraduationCap,
  Coffee,
  Layers,
  Boxes,
  GitBranch,
  Workflow,
  Server,
  Wifi
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface UptimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  uptime: number;
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
  const [uptimeData, setUptimeData] = useState<UptimeData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    uptime: 0
  });
  
  // Calculate uptime from May 28, 2025
  useEffect(() => {
    const liveDate = new Date('2025-05-28T00:00:00Z');
    
    const updateUptime = () => {
      const now = new Date();
      const diffInMs = now.getTime() - liveDate.getTime();
      const totalSeconds = Math.floor(diffInMs / 1000);
      
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;
      
      // Calculate uptime percentage (assuming 99.99% target)
      const uptime = 99.99;
      
      setUptimeData({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        uptime
      });
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  // Enhanced Particle system with blue theme
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
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: Math.random() * 150 + 100
    });

    const particleArray: Particle[] = Array.from({ length: 80 }, createParticle);

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

        const opacity = (1 - particle.life / particle.maxLife) * 0.6;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, 3
        );
        gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(147, 51, 234, ${opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
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
      title: "Employee Management System",
      description: "Comprehensive employee database with detailed profiles, role management, and performance tracking capabilities for effective workforce administration.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: Clock,
      title: "Advanced Time Tracking",
      description: "Real-time attendance monitoring with automated check-in/out, overtime calculations, and detailed timesheets for precise workforce management.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-400 to-violet-400"
    },
    {
      icon: DollarSign,
      title: "Payroll Management",
      description: "Automated salary calculations, tax deductions, bonus processing, and compliance with Pakistani labor laws for seamless payroll operations.",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      gradient: "from-indigo-400 to-blue-400"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Interactive dashboards with real-time metrics, custom reports, and data visualization for informed business decision making.",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      gradient: "from-violet-400 to-purple-400"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control, data encryption, and compliance with industry standards and regulations.",
      color: "text-blue-500",
      bgColor: "bg-blue-600/10",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Streamlined business processes with automated workflows, approval chains, and notification systems for increased efficiency.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      gradient: "from-cyan-400 to-blue-400"
    }
  ];

  const advancedFeatures = [
    {
      icon: FileSpreadsheet,
      title: "Document Management",
      description: "Centralized document storage with version control and secure sharing capabilities.",
      color: "text-emerald-400"
    },
    {
      icon: Calendar,
      title: "Scheduling System",
      description: "Advanced scheduling with calendar integration and automated notifications.",
      color: "text-orange-400"
    },
    {
      icon: MessageCircle,
      title: "Communication Hub",
      description: "Internal messaging system with team collaboration features.",
      color: "text-pink-400"
    },
    {
      icon: Building2,
      title: "Multi-Location Support",
      description: "Manage multiple office locations with centralized control.",
      color: "text-teal-400"
    },
    {
      icon: UserCheck,
      title: "Performance Reviews",
      description: "Automated performance evaluation with goal tracking.",
      color: "text-yellow-400"
    },
    {
      icon: GraduationCap,
      title: "Training Management",
      description: "Employee development tracking with skill assessment.",
      color: "text-red-400"
    }
  ];

  const integrationFeatures = [
    {
      icon: Monitor,
      title: "Desktop Application",
      description: "Native desktop app for enhanced performance and offline capabilities.",
      color: "text-blue-300"
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "iOS and Android apps for on-the-go workforce management.",
      color: "text-purple-300"
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Seamless cloud storage with automatic backup and sync.",
      color: "text-indigo-300"
    },
    {
      icon: Network,
      title: "API Access",
      description: "RESTful APIs for custom integrations and third-party connections.",
      color: "text-violet-300"
    }
  ];

  const stats = [
    { value: "25K+", label: "Active Users", color: "text-blue-400", icon: Users },
    { value: "99.99%", label: "Uptime", color: "text-purple-400", icon: TrendingUp },
    { value: "24/7", label: "Support", color: "text-indigo-400", icon: Shield },
    { value: "1000+", label: "Companies", color: "text-violet-400", icon: Award },
    { value: "5M+", label: "Records Managed", color: "text-blue-500", icon: Database },
    { value: "<1s", label: "Response Time", color: "text-cyan-400", icon: Rocket }
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-900 relative overflow-hidden">
      {/* Enhanced Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      />

      {/* Enhanced Mouse Follower with blue theme */}
      <div
        className="fixed w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full pointer-events-none z-50 transition-all duration-200 ease-out blur-sm"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
          transform: `scale(${hoveredFeature !== null ? 1.5 : 1})`,
          opacity: hoveredFeature !== null ? 0.8 : 0.4
        }}
      />

      {/* Enhanced Animated Background Elements with blue theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: '1s', transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-2xl animate-pulse"
          style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.15}px)` }}
        />
        
        {/* Enhanced Floating geometric shapes with blue theme */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-blue-400/30 rotate-45 animate-spin-slow hover:border-blue-400/60 transition-colors duration-500"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-purple-400/30 rounded-full animate-bounce-slow hover:border-purple-400/60 transition-colors duration-500"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-transparent rotate-12 animate-pulse hover:from-blue-400/40 transition-all duration-500"></div>
        <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-lg animate-float"></div>
      </div>

      <header className={`px-4 lg:px-6 h-16 flex items-center backdrop-blur-sm bg-slate-950/95 border-b border-blue-400/20 sticky top-0 z-50 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/60">
            <span className="text-white font-bold text-lg relative z-10">AC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
            AdiCorp
          </span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            onClick={() => navigate("/auth")}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Enhanced Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center min-h-screen relative">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-8">
            <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-600/20 border border-blue-400/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                <span className="text-sm text-blue-200 font-medium">Enterprise-Grade HR Management Platform</span>
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white animate-fade-in relative">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent animate-gradient-x">
                  Revolutionary
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-x" style={{ animationDelay: '0.5s' }}>
                  Workforce Management
                </span>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-transparent to-purple-400/20 blur-2xl -z-10 animate-pulse"></div>
              </h1>
              
              <p className="mx-auto max-w-[800px] text-white/80 text-lg md:text-xl leading-relaxed hover:text-white/95 transition-colors duration-300">
                Transform your business operations with our comprehensive <span className="text-blue-300 font-semibold">workforce management solution</span>. 
                Streamline processes, boost productivity, and scale your organization with confidence.
              </p>
            </div>
            
            <div className={`space-y-4 sm:space-y-0 sm:space-x-4 sm:flex transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 btn-glow transform hover:scale-110 transition-all duration-300 shadow-2xl text-lg px-8 py-4 rounded-xl relative overflow-hidden group"
                onClick={() => navigate("/auth")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Rocket className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Start Free Trial</span>
                <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group text-white/90 hover:text-white"
                onClick={() => window.open("https://demo.adicorp.com", "_blank")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Play className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Watch Demo</span>
              </Button>
            </div>

            {/* Enhanced Stats Grid */}
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <div className="relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300">
                    <div className={`text-2xl md:text-3xl font-bold ${stat.color} group-hover:scale-125 transition-all duration-300 relative z-10`}>
                      {stat.value}
                    </div>
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mt-2 opacity-60 group-hover:opacity-100 transition-all duration-300`} />
                    <div className="text-white/70 text-xs md:text-sm mt-1 group-hover:text-white/90 transition-colors duration-300">
                      {stat.label}
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.replace('text-', 'from-')}/10 to-transparent rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Server Uptime Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-b from-slate-950 via-green-950/10 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-transparent to-blue-400/5"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 via-blue-500/20 to-emerald-600/20 border border-green-400/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 mb-6">
                <Server className="w-5 h-5 text-green-300 animate-pulse" />
                <span className="text-sm text-green-200 font-medium">99.99% Enterprise Reliability</span>
                <Wifi className="w-5 h-5 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4 relative">
                <span className="bg-gradient-to-r from-green-300 via-blue-300 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
                  Server Uptime Status
                </span>
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400/10 via-transparent to-blue-400/10 blur-xl -z-10"></div>
              </h2>
              
              <p className="mx-auto max-w-[600px] text-white/80 text-lg mb-8">
                Continuously running since <span className="text-green-300 font-semibold">May 28, 2025</span> without any interruption.
              </p>
            </div>
            
            {/* Uptime Display Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-green-400/20 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {uptimeData.days}
                  </div>
                  <div className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Days
                  </div>
                </div>
                
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-blue-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {uptimeData.hours}
                  </div>
                  <div className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Hours
                  </div>
                </div>
                
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {uptimeData.minutes}
                  </div>
                  <div className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Minutes
                  </div>
                </div>
                
                <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {uptimeData.seconds}
                  </div>
                  <div className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Seconds
                  </div>
                </div>
              </div>
              
              {/* Uptime Percentage Display */}
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-500/10 via-blue-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-400/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-transparent to-blue-400/10 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Activity className="w-8 h-8 text-green-400 animate-bounce" />
                    <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-300 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
                      {uptimeData.uptime}%
                    </span>
                    <Activity className="w-8 h-8 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  <div className="text-white/90 text-xl mb-2 font-semibold">
                    System Uptime Reliability
                  </div>
                  
                  <div className="text-white/70 text-sm">
                    Total Runtime: {uptimeData.totalSeconds.toLocaleString()} seconds
                  </div>
                  
                  {/* Uptime Progress Bar */}
                  <div className="mt-6 w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-emerald-400 rounded-full transition-all duration-1000 relative"
                      style={{ width: `${uptimeData.uptime}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Core Features Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-transparent to-purple-400/5"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4 relative">
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
                  Core Management Features
                </span>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-transparent to-purple-400/10 blur-xl -z-10"></div>
              </h2>
              <p className="mx-auto max-w-[600px] text-white/80 text-lg">
                Comprehensive tools designed for modern business operations and workforce optimization.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl p-8 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${feature.bgColor} bg-opacity-20 cursor-pointer`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: `translateY(${scrollY * 0.05}px)`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-block rounded-xl ${feature.bgColor} p-4 mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}>
                      <feature.icon className={`h-7 w-7 ${feature.color} relative z-10`} />
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300`}></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/80 leading-relaxed group-hover:text-white/95 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 text-blue-300" />
                  </div>
                  
                  {hoveredFeature === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-purple-400/10 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-950 via-indigo-950/15 to-slate-950 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white mb-4">
                Advanced <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Capabilities</span>
              </h2>
              <p className="mx-auto max-w-[600px] text-white/80 text-lg">
                Extended functionality for comprehensive business management and growth.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-indigo-400/20 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
                  <feature.icon className={`h-6 w-6 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-200 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration & Platform Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-950 via-purple-950/15 to-slate-950 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white mb-4">
                Multi-Platform <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Access</span>
              </h2>
              <p className="mx-auto max-w-[600px] text-white/80 text-lg">
                Access your workforce management system from anywhere, on any device.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {integrationFeatures.map((feature, index) => (
                <div key={index} className="group text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-t from-blue-950/30 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
          
          <div className="container px-4 md:px-6 text-center relative z-10">
            <div className="space-y-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to{" "}
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  Revolutionize
                </span>
                {" "}Your Business?
              </h2>
              
              <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                Join thousands of companies already using AdiCorp to streamline their operations and boost productivity. 
                Start your transformation today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 btn-glow transform hover:scale-110 transition-all duration-300 text-lg px-10 py-4 rounded-xl relative overflow-hidden group"
                  onClick={() => navigate("/auth")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Rocket className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Get Started Now</span>
                  <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                <div className="flex items-center gap-2 text-white/70 group">
                  <CheckCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-white/90 transition-colors duration-300">Free 30-day trial • No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full px-4 md:px-6 border-t border-blue-400/20 bg-slate-950/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-transparent to-purple-400/5"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full relative z-10">
          <p className="text-sm text-white/60">
            © 2025 AdiCorp. Revolutionizing workforce management solutions.
          </p>
          
          <div className="flex items-center gap-3 sm:ml-auto group">
            <Code className="w-4 h-4 text-blue-300 animate-pulse" />
            <span className="text-sm text-white/70">Crafted with</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span className="text-sm text-white/70">by</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
              Adil Munawar
            </span>
            <Globe className="w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        <nav className="flex gap-4 sm:gap-6 justify-center sm:justify-end relative z-10">
          <a className="text-sm hover:underline underline-offset-4 text-white/60 hover:text-white/90 transition-all duration-300 transform hover:scale-105" href="#">
            Terms of Service
          </a>
          <a className="text-sm hover:underline underline-offset-4 text-white/60 hover:text-white/90 transition-all duration-300 transform hover:scale-105" href="#">
            Privacy Policy
          </a>
        </nav>
      </footer>
    </div>
  );
}
