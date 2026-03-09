import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ClipboardList } from "lucide-react";
import { AdminInternshipsTab } from "@/components/admin/scholarship/AdminInternshipsTab";
import { AdminInternshipWaitlistTab } from "@/components/admin/internships/AdminInternshipWaitlistTab";

const AdminInternships = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Internship Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage all internship profiles and waitlist applications
        </p>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Waitlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <AdminInternshipsTab />
        </TabsContent>

        <TabsContent value="waitlist">
          <AdminInternshipWaitlistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInternships;
