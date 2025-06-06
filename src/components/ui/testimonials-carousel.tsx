
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  position: string;
  username: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ayesha Khan",
    company: "Tech Solutions Ltd",
    position: "CEO",
    username: "@ayeshakhan",
    content: "AdiCorp transformed our HR processes completely. The automation saved us hours every week and improved our efficiency dramatically. It blows my mind how intuitive and powerful this platform is.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Fatima Sheikh", 
    company: "Green Industries",
    position: "HR Director",
    username: "@fatimasheikh",
    content: "The most user-friendly HR system we've ever used. Highly recommend for Pakistani businesses looking to modernize their operations. AdiCorp is absolutely a beast for automation.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Muhammad Ali",
    company: "Digital Ventures",
    position: "Operations Manager",
    username: "@muhammadali",
    content: "I've said it many times. But I'll say it again. AdiCorp is the GOAT. Anything is possible with this platform. You just need some technical knowledge + imagination. I'm actually looking to start a side project just to have an excuse to use AdiCorp more 😄",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sarah Ahmad",
    company: "Innovation Corp",
    position: "CTO",
    username: "@sarahahmad",
    content: "Outstanding platform with seamless integration. AdiCorp has revolutionized how we manage our workforce and track productivity. The analytics features are phenomenal.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Zara Bukhari",
    company: "Smart Solutions",
    position: "HR Manager",
    username: "@zarabukhari",
    content: "Incredible user experience and powerful features. The employee management system is intuitive and comprehensive. Self-hosting and low-code make every HR manager's dream come true.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Amna Rashid",
    company: "ProBusiness Ltd",
    position: "Managing Director",
    username: "@amnarashid",
    content: "AdiCorp exceeded our expectations. The system is robust, reliable, and has significantly improved our operational efficiency. It just has everything we need in one platform.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "Sana Malik",
    company: "Future Tech",
    position: "Founder",
    username: "@sanamalik",
    content: "The analytics and reporting features are phenomenal. We can now make data-driven decisions about our human resources. AdiCorp has completely automated our validation processes.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 8,
    name: "Mariam Hassan",
    company: "Digital Innovations",
    position: "Product Manager",
    username: "@mariamhassan",
    content: "This platform has transformed how we handle employee data and attendance. The interface is so clean and the features are exactly what modern businesses need.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 9,
    name: "Nida Javed",
    company: "Tech Horizon",
    position: "VP Operations",
    username: "@nidajaved",
    content: "Outstanding support and seamless workflow automation. AdiCorp has made managing our workforce incredibly efficient and the reporting capabilities are top-notch.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-full">
          {getVisibleTestimonials().map((testimonial, index) => (
            <Card 
              key={`${testimonial.id}-${currentIndex}-${index}`}
              className="relative overflow-hidden p-8 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/40 to-slate-900/90 border border-purple-500/20 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.3), rgba(15, 23, 42, 0.95))',
              }}
            >
              {/* Gradient overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current transform hover:scale-125 transition-transform duration-200" 
                      style={{ animationDelay: `${i * 100}ms` }} 
                    />
                  ))}
                </div>
                
                <p className="text-white/90 mb-8 italic leading-relaxed text-lg font-medium">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-purple-400/40 object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg">{testimonial.name}</div>
                    <div className="text-purple-300 text-sm font-medium">{testimonial.username}</div>
                    <div className="text-purple-400 text-sm">{testimonial.position}</div>
                    <div className="text-white/60 text-xs">{testimonial.company}</div>
                  </div>
                </div>
              </div>

              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-xl opacity-75">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-gradient-x"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced dot indicators */}
      <div className="flex justify-center mt-12 gap-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125 shadow-lg shadow-purple-500/50' 
                : 'bg-white/30 hover:bg-white/50 hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
