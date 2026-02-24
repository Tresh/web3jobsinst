import { useState } from "react";
import { Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBootcamps } from "@/hooks/useBootcamps";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Users,
  Clock,
  Search,
  Plus,
  Sparkles,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import type { Bootcamp } from "@/types/bootcamp";

const BootcampCard = ({ bootcamp }: { bootcamp: Bootcamp }) => {
  const getStatusBadge = () => {
    if (bootcamp.status === "completed") {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Completed</Badge>;
    }
    if (bootcamp.status === "active") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Ongoing</Badge>;
    }
    if (bootcamp.registration_open && bootcamp.current_participants < bootcamp.max_participants) {
      return <Badge className="bg-primary/10 text-primary border-primary/20">Registration Open</Badge>;
    }
    return <Badge variant="secondary">Full</Badge>;
  };

  const getTypeBadge = () => {
    return bootcamp.bootcamp_type === "free" ? (
      <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>
    ) : (
      <Badge variant="outline" className="border-amber-500 text-amber-500">Paid</Badge>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {bootcamp.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {getTypeBadge()}
            {getStatusBadge()}
          </div>
        </div>
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
          {bootcamp.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          Hosted by <span className="text-foreground font-medium">{bootcamp.host_name}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {bootcamp.description}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{bootcamp.duration_days} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{bootcamp.current_participants} / {bootcamp.max_participants}</span>
          </div>
          {bootcamp.start_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(bootcamp.start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Link to={`/bootcamps/${bootcamp.id}`}>
            <Button className="w-full" variant={bootcamp.status === "completed" ? "outline" : "default"}>
              {bootcamp.status === "completed" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Details
                </>
              ) : bootcamp.status === "active" ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  View Bootcamp
                </>
              ) : (
                "Join Bootcamp"
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const Bootcamps = () => {
  const { bootcamps, loading, error } = useBootcamps();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBootcamps = bootcamps.filter((bootcamp) => {
    const matchesSearch = bootcamp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bootcamp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bootcamp.host_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || bootcamp.bootcamp_type === typeFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "open" && bootcamp.registration_open && bootcamp.status !== "completed") ||
      (statusFilter === "active" && bootcamp.status === "active") ||
      (statusFilter === "completed" && bootcamp.status === "completed");

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen overflow-x-hidden">
      <UnifiedNavbar />
      
      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="py-10 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="section-container text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Web3 Bootcamps
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Join intensive, community-driven bootcamps designed to accelerate your journey 
              in Web3. Complete daily tasks, earn XP, and learn from industry experts.
            </p>
            
            {user && (
              <Link to="/bootcamps/create">
                <Button size="lg" variant="outline" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Start Your Own Bootcamp
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Filters Section */}
        <section className="section-container py-6 border-b border-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bootcamps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Registration Open</SelectItem>
                  <SelectItem value="active">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </section>

        {/* Bootcamps Grid */}
        <section className="section-container py-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-3">
                      <div className="h-6 bg-muted rounded w-24" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-12 bg-muted rounded" />
                      <div className="h-10 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load bootcamps: {error}</p>
              </div>
            ) : filteredBootcamps.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No bootcamps found matching your criteria.</p>
                {user && (
                  <Link to="/bootcamps/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create a Bootcamp
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBootcamps.map((bootcamp) => (
                  <BootcampCard key={bootcamp.id} bootcamp={bootcamp} />
                ))}
              </div>
            )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Bootcamps;
