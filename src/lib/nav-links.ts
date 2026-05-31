import {
  Car,
  CircleDot,
  Fuel,
  Home,
  Settings,
  User,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/driver", label: "Driver", icon: User },
  { href: "/car", label: "Car", icon: Car },
  { href: "/fuel", label: "Fuel Consumption", icon: Fuel },
  { href: "/tires", label: "Tire Wear", icon: CircleDot },
  { href: "/setup", label: "Car Setup", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
];
