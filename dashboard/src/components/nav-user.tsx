"use client";

import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronsUpDown, LogOut, Moon, Sun, User } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { getUsername, updateUsername } from "@/api/user";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { logout, user } = useAuth0();
  const { setTheme, theme } = useTheme();
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayUsername = username ?? user?.name ?? "Unknown user";

  const initials = displayUsername
    .split(" ")
    .map((name, index) => (index < 2 ? name[0] : ""))
    .join("")
    .toUpperCase();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
      .then((r) => {
        toast("Logged out successfully.");
        console.log(r);
      })
      .catch((error) => {
        toast("Failed to log out.");
        console.error("Logout error:", error);
      });
  };

  const submitNewUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    setIsUpdatingUsername(true);
    try {
      await updateUsername(newUsername);
      setUsername(newUsername);
      toast.success("Username updated successfully.");
      setIsDialogOpen(false);
      setNewUsername("");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error(`Error updating username: ${error}`);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const fetchUserName = async () => {
    try {
      const data = await getUsername();
      setUsername(data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to load user name:", apiError);
      if (apiError.status >= 500) {
        toast.error("Server error fetching user name");
      }
    }
  };

  const handleOpenUsernameDialog = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setIsDialogOpen(true);
      setNewUsername(displayUsername);
    }, 100);
  };

  React.useEffect(() => {
    fetchUserName();
  }, [user]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={username} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {displayUsername}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="pe-4 min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={username} />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {displayUsername}
                    </span>
                    <span className="truncate text-xs">{user?.sub}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {(theme === "light" && <Moon />) || <Sun />}
                Toggle Appearance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleOpenUsernameDialog}>
                <User />
                Update Username
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={submitNewUsername}>
            <DialogHeader>
              <DialogTitle>Edit Username</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdatingUsername}>
                {isUpdatingUsername ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
