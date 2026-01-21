import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { talents } from "@/data/talentsData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AdminTalents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredTalents = talents.filter((talent) =>
    talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    talent.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (talentId: string) => {
    toast({
      title: "Edit Talent",
      description: "Talent editing will be available soon",
    });
  };

  const handleDelete = (talentId: string) => {
    toast({
      title: "Delete Talent",
      description: "Talent deletion will be available soon",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Talent Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage talent listings and profiles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Talent
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search talents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">{filteredTalents.length} talents</Badge>
      </div>

      {/* Talents Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Talent</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTalents.map((talent) => (
              <TableRow key={talent.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={talent.avatar} />
                      <AvatarFallback>
                        {talent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{talent.name}</p>
                      <p className="text-sm text-muted-foreground">{talent.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{talent.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{talent.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {talent.completedProjects}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {talent.hourlyRate ? `$${talent.hourlyRate}/hr` : "N/A"}
                </TableCell>
                <TableCell>
                  {talent.available ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Unavailable
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(talent.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(talent.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTalents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No talents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTalents;
