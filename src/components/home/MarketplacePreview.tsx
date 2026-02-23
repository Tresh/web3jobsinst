import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Package, Rocket, Clock, Users } from "lucide-react";

const featuredCourses = [
  {
    id: "1",
    title: "Web3 Fundamentals",
    category: "Foundations",
    price: "Free",
    duration: "4h 30m",
    image: "/placeholder.svg",
    level: "Beginner",
  },
  {
    id: "2",
    title: "Smart Contract Development",
    category: "Development",
    price: "$49",
    duration: "8h 15m",
    image: "/placeholder.svg",
    level: "Intermediate",
  },
  {
    id: "3",
    title: "DeFi Trading Strategies",
    category: "Trading",
    price: "$79",
    duration: "6h 45m",
    image: "/placeholder.svg",
    level: "Advanced",
  },
];

const featuredProducts = [
  {
    id: "1",
    title: "Crypto YouTube Automation Guide",
    creator: "Web3 Academy",
    price: "$29",
    downloads: "245+",
    category: "Ebook",
  },
  {
    id: "2",
    title: "AI Content Writer Tool",
    creator: "ContentAI",
    price: "$19",
    downloads: "389+",
    category: "Tool",
  },
  {
    id: "3",
    title: "Smart Contract Templates",
    creator: "DevDAO",
    price: "Free",
    downloads: "876+",
    category: "Template",
  },
];

const featuredBootcamps = [
  {
    id: "1",
    title: "Web3 Developer Bootcamp",
    host: "Web3 Jobs Institute",
    duration: "21 Days",
    participants: 45,
    status: "Active",
  },
  {
    id: "2",
    title: "Content Creator Accelerator",
    host: "Creator Labs",
    duration: "14 Days",
    participants: 32,
    status: "Enrolling",
  },
];

const MarketplacePreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Explore the Marketplace
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Courses, digital products, and bootcamps to accelerate your Web3 journey
          </p>
        </div>

        {/* Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Featured Courses</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/courses")} className="gap-1 text-muted-foreground hover:text-foreground hover:bg-white/5">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="cursor-pointer bg-white/5 border-white/10 hover:border-primary/30 transition-all group overflow-hidden">
                <div className="aspect-video bg-white/5 relative">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-white/10 text-foreground border-0">Coming Soon</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground/70 border-0">{course.category}</Badge>
                    <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground/70 border-0">{course.level}</Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </div>
                    <span className="font-semibold text-primary">{course.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Digital Products</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/products")} className="gap-1 text-muted-foreground hover:text-foreground hover:bg-white/5">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer bg-white/5 border-white/10 hover:border-primary/30 transition-all group">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] mb-3 bg-white/10 text-foreground/70 border-0">{product.category}</Badge>
                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">by {product.creator}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{product.downloads} downloads</span>
                    <span className="font-semibold text-primary">{product.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bootcamps */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Active Bootcamps</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/bootcamps")} className="gap-1 text-muted-foreground hover:text-foreground hover:bg-white/5">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredBootcamps.map((bootcamp) => (
              <Card key={bootcamp.id} className="cursor-pointer bg-white/5 border-white/10 hover:border-primary/30 transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] border-0 ${bootcamp.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                    >
                      {bootcamp.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {bootcamp.participants} joined
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {bootcamp.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">Hosted by {bootcamp.host}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{bootcamp.duration}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-white/20 text-foreground hover:bg-white/10">
                      Join Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
