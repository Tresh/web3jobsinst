import { Button } from "@/components/ui/button";
import { Handshake, Code, Palette, Megaphone, ArrowRight } from "lucide-react";

const CollabSection = () => {
  return (
    <section id="collab" className="bg-gray-50 section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-elevated bg-card p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Developers</span>
              </div>
              <div className="card-elevated bg-card p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Designers</span>
              </div>
              <div className="card-elevated bg-card p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Marketers</span>
              </div>
              <div className="card-elevated bg-card p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Handshake className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Founders</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-6">
              Collab Market
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Collab Market
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              A marketplace where creators, developers, marketers, and founders collaborate 
              on real projects. Trade skills for opportunities, not just certificates. 
              Build your portfolio while earning and expanding your network.
            </p>
            <Button variant="hero" size="lg" className="group">
              Explore Collab Market
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollabSection;
