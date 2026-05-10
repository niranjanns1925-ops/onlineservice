import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileText, Shield, Clock, MousePointerClick, ArrowRight, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <div ref={containerRef} className="flex flex-col items-center overflow-hidden bg-background">
      {/* Immersive Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-4">
        {/* Atmospheric Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <Cpu className="w-3 h-3" />
              <span>Next-Gen E-Governance Portal</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.9] text-foreground"
              >
                Lakshmi <span className="text-primary italic">E-Sevai</span> <br /> Maiyam
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <p className="text-2xl md:text-3xl font-bold text-foreground/80 leading-snug">
                  "எளிய தீர்வுகள், நம்பகமான சேவை – ஒரே இடத்தில்!”
                </p>
                <p className="text-sm md:text-md text-muted-foreground font-bold uppercase tracking-widest border-l-2 border-primary pl-4">
                  Simple Solutions, Trusted Service.
                </p>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground font-medium max-w-lg leading-relaxed"
            >
              Transforming bureaucratic complexity into digital simplicity. Access certificates, licenses, and official services with biometric-grade security.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 flex gap-2 text-md font-bold group">
                  Enter Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-accent flex items-center justify-center text-[10px] font-bold text-primary">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="flex items-center ml-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  +1.2k active users today
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3D Animated Illustration Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden lg:block relative perspective-1000"
          >
            <motion.div 
              animate={{ 
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, -5, 0, 5, 0],
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full aspect-square max-w-[500px] mx-auto"
            >
              {/* Central Floating Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/10 rounded-[48px] backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center p-12 overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/40 relative">
                    <Globe className="w-16 h-16 text-white animate-spin-slow" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    </div>
                 </div>
                 <div className="text-center space-y-2">
                   <p className="text-3xl font-black text-foreground uppercase tracking-tighter">Digital Access</p>
                   <p className="text-sm font-bold text-primary tracking-[0.3em] uppercase">Unified Service Hub</p>
                 </div>
                 <div className="mt-8 grid grid-cols-3 gap-3 w-full">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-2 bg-primary/10 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                          className="w-1/2 h-full bg-primary"
                        ></motion.div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Orbiting Elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] border border-dashed border-primary/20 rounded-full"
              ></motion.div>

              <motion.div
                style={{ y: y1 }}
                className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-primary/10"
              >
                <Shield className="w-10 h-10 text-primary" />
              </motion.div>

              <motion.div
                style={{ y: y2 }}
                className="absolute bottom-20 -left-12 w-20 h-20 bg-primary text-white rounded-[24px] shadow-xl flex items-center justify-center"
              >
                <FileText className="w-8 h-8" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="w-full py-32 px-4 relative bg-accent/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">Our Capabilities</h2>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Why Millions Trust <br />Lakshmi E-Sevai</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
               { 
                 title: "Rapid Issuance", 
                 desc: "Automated verification pipelines ensure your documents reach you in record time.", 
                 icon: <Clock className="w-6 h-6" />,
                 color: "primary" 
               },
               { 
                 title: "Zero Breach", 
                 desc: "Enterprise-grade encryption protecting your PII data at every touchpoint.", 
                 icon: <Shield className="w-6 h-6" />,
                 color: "emerald-500"
               },
               { 
                 title: "Instant Alerts", 
                 desc: "Proactive push notifications regarding status changes and upcoming renewals.", 
                 icon: <FileText className="w-6 h-6" />,
                 color: "primary"
               },
               { 
                 title: "Fluent UX", 
                 desc: "A frictionless application journey designed for both mobile and desktop utility.", 
                 icon: <MousePointerClick className="w-6 h-6" />,
                 color: "emerald-600"
               }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[32px] border border-primary/5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all group"
              >
                <div className={`bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">{feature.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote Section */}
      <section className="py-32 w-full px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <div className="flex justify-center gap-1">
             {[1, 2, 3, 4, 5].map(i => <CheckCircle2 key={i} className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />)}
           </div>
           <blockquote className="text-3xl md:text-5xl font-serif italic text-foreground/90 leading-tight tracking-tight">
             "Our mission is to bridge the digital divide, ensuring every citizen receives seamless government access through technological excellence."
           </blockquote>
           <div className="space-y-1">
             <p className="font-bold text-lg text-primary">Niranjan NS</p>
             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Managing Director, Lakshmi Maiyam</p>
           </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="w-full pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[0.9]">Ready to experience true digital freedom?</h2>
               <p className="text-primary-foreground/70 text-lg md:text-xl font-medium">Join over 10,000 citizens who have simplified their lives with our portal.</p>
               <Link to="/login">
                 <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                    Get Started Today
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

