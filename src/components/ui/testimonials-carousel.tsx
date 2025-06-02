
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
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ahmed Khan",
    company: "Tech Solutions Ltd",
    position: "CEO",
    content: "AdiCorp transformed our HR processes completely. The automation saved us hours every week and improved our efficiency dramatically.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Fatima Sheikh", 
    company: "Green Industries",
    position: "HR Director",
    content: "The most user-friendly HR system we've ever used. Highly recommend for Pakistani businesses looking to modernize their operations.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Muhammad Ali",
    company: "Digital Ventures",
    position: "Operations Manager",
    content: "Excellent support and features. The attendance tracking is incredibly accurate and the payroll automation is a game-changer.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sarah Ahmad",
    company: "Innovation Corp",
    position: "CTO",
    content: "Outstanding platform with seamless integration. AdiCorp has revolutionized how we manage our workforce and track productivity.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Hassan Malik",
    company: "Future Tech",
    position: "Founder",
    content: "The analytics and reporting features are phenomenal. We can now make data-driven decisions about our human resources.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Zara Bukhari",
    company: "Smart Solutions",
    position: "HR Manager",
    content: "Incredible user experience and powerful features. The employee management system is intuitive and comprehensive.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "Omar Rashid",
    company: "ProBusiness Ltd",
    position: "Managing Director",
    content: "AdiCorp exceeded our expectations. The system is robust, reliable, and has significantly improved our operational efficiency.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face"
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
              className="glass-card p-6 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl relative overflow-hidden group bg-adicorp-dark-light/50 border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-adicorp-purple/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current transform hover:scale-125 transition-transform duration-200" 
                      style={{ animationDelay: `${i * 100}ms` }} 
                    />
                  ))}
                </div>
                
                <p className="text-white/80 mb-6 italic group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-adicorp-purple/30 group-hover:border-adicorp-purple transition-colors duration-300 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-adicorp-purple/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-adicorp-purple text-sm">{testimonial.position}</div>
                    <div className="text-white/60 text-xs">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center mt-8 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-adicorp-purple scale-125 shadow-lg shadow-adicorp-purple/50' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
