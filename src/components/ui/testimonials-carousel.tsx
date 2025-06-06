
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  content: string;
  avatar: string;
  position: string;
  username: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ahmad Hassan",
    company: "TechVision Pakistan",
    position: "CEO",
    username: "@ahmadhassan",
    content: "AdiCorp has completely transformed our HR operations. The AI-powered automation is incredible and has saved us countless hours every week. It's exactly what Pakistani businesses need.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Fatima Ali",
    company: "Digital Solutions Ltd",
    position: "Operations Director",
    username: "@fatimaali",
    content: "The platform is incredibly intuitive. We've streamlined our entire workforce management process and the analytics provide insights we never had before.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Ayesha Khan",
    company: "Innovation Hub",
    position: "HR Manager",
    username: "@ayeshakhan",
    content: "AdiCorp's automation capabilities are phenomenal. The employee management system is so smooth and efficient that it feels like magic.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Zara Ahmed",
    company: "Future Technologies",
    position: "Product Manager",
    username: "@zaraahmed",
    content: "The real-time analytics and reporting features have revolutionized how we make decisions. It's like having a crystal ball for workforce planning.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Sana Malik",
    company: "Smart Enterprises",
    position: "CTO",
    username: "@sanamalik",
    content: "The integration was seamless and the support team is outstanding. AdiCorp has become an essential part of our daily operations.",
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Mariam Sheikh",
    company: "Progressive Solutions",
    position: "Founder",
    username: "@mariamsheikh",
    content: "Finally, an HR platform that understands the Pakistani market. The compliance features and local regulations support is exceptional.",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "Nida Rashid",
    company: "TechForward",
    position: "VP Operations",
    username: "@nidarashid",
    content: "The AI insights have helped us identify patterns we never knew existed. Our productivity has increased by 40% since implementing AdiCorp.",
    avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 8,
    name: "Hira Bukhari",
    company: "NextGen Systems",
    position: "Chief Innovation Officer",
    username: "@hirabukhari",
    content: "The platform's scalability is impressive. As we've grown from 50 to 500 employees, AdiCorp has effortlessly adapted to our needs.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 9,
    name: "Amna Javed",
    company: "Digital Innovations",
    position: "Strategy Director",
    username: "@amnajaved",
    content: "The security features give us complete peace of mind. Our employee data is protected with enterprise-grade encryption and compliance.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsTransitioning(false);
      }, 150);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
      <div className="flex gap-6 justify-center">
        {getVisibleTestimonials().map((testimonial, index) => (
          <div 
            key={`${testimonial.id}-${currentIndex}-${index}`}
            className={`transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
            style={{ 
              width: '400px',
              height: '280px'
            }}
          >
            <Card className="relative h-full p-6 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 border border-blue-400/20 rounded-3xl backdrop-blur-xl hover:border-blue-400/40 transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <p className="text-white/90 mb-6 italic leading-relaxed text-base flex-1 overflow-hidden">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-400/30 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{testimonial.name}</div>
                    <div className="text-blue-300 text-xs truncate">{testimonial.username}</div>
                    <div className="text-blue-400 text-xs truncate">{testimonial.position}</div>
                    <div className="text-white/60 text-xs truncate">{testimonial.company}</div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-50">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"></div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
