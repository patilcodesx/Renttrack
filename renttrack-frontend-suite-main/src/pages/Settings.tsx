import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, FileText, Download, Plus, Trash2, Edit2, Shield, Zap,
} from "lucide-react";
import { api } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { PrimaryButton } from "@/components/renttrack/PrimaryButton";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [ocrConfidence, setOcrConfidence] = useState([95]);
  const [autoProcess, setAutoProcess] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);

  const handleExport = (type: string) => {
    toast({
      title: `Exporting ${type}...`,
      description: "Your file will download shortly.",
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin")
      return <Badge className="bg-primary/10 text-primary border-primary/30">Admin</Badge>;
    if (role === "manager")
      return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">Manager</Badge>;
    return <Badge variant="outline">Staff</Badge>;
  };

  return (
    <DashboardLayout>
      <Header title="Settings" subtitle="Configure RentTrack preferences" />

      <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-1" /> Users
            </TabsTrigger>
            <TabsTrigger value="ocr">
              <FileText className="w-4 h-4 mr-1" /> OCR
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-1" /> Export
            </TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage team roles and access</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OCR Settings */}
          <TabsContent value="ocr" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  OCR Settings
                </CardTitle>
                <CardDescription>Document processing preferences</CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">

                {/* Confidence */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Confidence</Label>
                    <span className="text-sm font-medium text-primary">{ocrConfidence[0]}%</span>
                  </div>
                  <Slider value={ocrConfidence} onValueChange={setOcrConfidence} min={50} max={100} step={5} />
                  <p className="text-sm text-muted-foreground">
                    Values below this threshold will be marked for review
                  </p>
                </div>

                {/* Auto Process */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                  <div className="space-y-1">
                    <Label>Auto-process Documents</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically extract OCR data on upload
                    </p>
                  </div>
                  <Switch checked={autoProcess} onCheckedChange={setAutoProcess} />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Default OCR Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts for low confidence extraction
                    </p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <PrimaryButton className="mt-2">Save Settings</PrimaryButton>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export */}
          <TabsContent value="export" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Export Data
                </CardTitle>
                <CardDescription>Download records</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Tenant Data", format: "CSV" },
                    { title: "Payment History", format: "CSV" },
                    { title: "Property Listings", format: "CSV" },
                    { title: "Lease Agreements", format: "PDF" },
                    { title: "Financial Report", format: "XLSX" },
                    { title: "Activity Log", format: "CSV" },
                  ].map((item) => (
                    <Card key={item.title} className="border-border shadow-none">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant="outline">{item.format}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handleExport(item.title)}
                        >
                          <Download className="w-4 h-4" /> Export
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
