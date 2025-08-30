import type { LucideIcon } from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as CardUI,
} from '@/components/ui/card';

function getIcon(name: string): LucideIcon {
  const icon = Object.keys(lucideIcons).find((key) => key.toLowerCase() === name.toLowerCase());

  return (icon ? lucideIcons[icon as keyof typeof lucideIcons] : lucideIcons.File) as LucideIcon;
}

interface CardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

export function Card({ title, description, icon, path }: CardProps) {
  const Icon = getIcon(icon);
  return (
    <CardUI className="flex flex-col h-full transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon className="w-6 h-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Link href={path}>
          <Button className="w-full">Learn More</Button>
        </Link>
      </CardFooter>
    </CardUI>
  );
}
