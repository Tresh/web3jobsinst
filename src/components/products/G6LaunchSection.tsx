import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const G6_SYSTEMS = [
  {
    title: "Make $500/Month With 3 Faceless TikTok Baby Pages",
    price: 49,
    seats: 200,
  },
  {
    title: "12 Websites That Can Pay You $300–$1,000 Monthly",
    price: 39,
    seats: 250,
  },
  {
    title: "Turn AI Videos Into $100/Day on TikTok",
    price: 69,
    seats: 120,
  },
  {
    title: "Copy-Paste Web3 Proposal Templates That Close Paid Deals",
    price: 89,
    seats: 100,
  },
  {
    title: "Build & Automate Crypto Trading Systems",
    price: 149,
    seats: 60,
  },
  {
    title: "$10,000 Web3 Grant Templates",
    price: 169,
    seats: 60,
  },
];

const G6LaunchSection = () => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60); // 72 hours in seconds
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      toast({ title: "You're on the list!", description: "We'll notify you when G6 enrollment opens." });
      setEmail("");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* HERO BANNER */}
      <section className="relative rounded-2xl border border-border bg-card p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Founding Launch
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            G6 — Founding Income Cohort
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-2">
            6 controlled-access income systems launching soon.
          </p>
          <p className="text-muted-foreground text-base md:text-lg mb-2">
            Limited seats per system.
          </p>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Enrollment opens soon.
          </p>

          {/* COUNTDOWN */}
          <div className="inline-flex items-center gap-2 bg-secondary/50 rounded-xl px-6 py-4 mb-8">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Waitlist Opens In:</span>
            <span className="text-2xl md:text-3xl font-mono font-bold text-foreground tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => scrollToSection("g6-waitlist")}>
              Join G6 Waitlist <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("g6-info")}>
              Learn About G6
            </Button>
          </div>
        </div>
      </section>

      {/* WHAT IS G6 */}
      <section id="g6-info" className="scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What is G6?</h2>
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <p className="text-muted-foreground mb-4">
            G6 is the founding launch of our income systems marketplace.
          </p>
          <p className="text-muted-foreground mb-4">
            Instead of permanently open digital products, each system is released in controlled cohorts with limited seats.
          </p>
          <p className="text-muted-foreground mb-2">Each cohort:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>Opens for a limited enrollment window</li>
            <li>Has capped seats</li>
            <li>Unlocks access for all participants at the same time</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            After enrollment closes, access becomes request-only.
          </p>
        </div>
      </section>

      {/* G6 SYSTEM PREVIEW */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">G6 Systems Preview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {G6_SYSTEMS.map((system, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <Badge variant="outline" className="mb-3 text-xs">
                  Upcoming Launch
                </Badge>
                <h3 className="font-semibold text-foreground text-base leading-snug mb-3 line-clamp-2">
                  {system.title}
                </h3>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-bold text-foreground">${system.price}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" /> {system.seats} seats
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => scrollToSection("g6-waitlist")}
              >
                Join Waitlist
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* WAITLIST SIGNUP */}
      <section id="g6-waitlist" className="scroll-mt-24">
        <div className="bg-card border border-border rounded-xl p-8 md:p-10 text-center max-w-xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Get Priority Access to G6</h2>
          <p className="text-muted-foreground mb-6">
            Join the waitlist to receive early access when enrollment opens.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default G6LaunchSection;
