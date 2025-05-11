import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  type?: 'success';
}

export function AuthCard({ title, description, children, type }: AuthCardProps) {
  return (
    <Card className="w-full max-w-[400px] mx-auto py-6 bg-white">
      {type && <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />}
      <CardHeader className={`${type ? 'flex flex-col items-center text-center' : ''}`}>
        <CardTitle className="text-2xl font-bold ">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
