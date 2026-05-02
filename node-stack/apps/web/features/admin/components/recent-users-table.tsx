"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";

export function RecentUsersTable({ users, className }: { users: any[]; className?: string }) {
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const handleImpersonate = async (userId: string) => {
    try {
      setImpersonating(userId);
      const { accessToken } = await fetcher<{ accessToken: string }>(`/api/admin/users/${userId}/impersonate`, {
        method: "POST",
      });
      
      // Clear current storage and set new token
      localStorage.setItem("access_token", accessToken);
      toast.success("Impersonation started. Redirecting...");
      
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Failed to impersonate user");
      setImpersonating(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Recently registered or active users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-label">                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-label">{user.name}</span>                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={impersonating === user.id}
                    onClick={() => handleImpersonate(user.id)}
                  >
                    {impersonating === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Impersonate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
