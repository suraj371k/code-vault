"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useCreateOrganization } from "@/hooks/organization/useCreateOrganization";
import { OrganizationInput } from "@/types/organization";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const Organization = () => {
  const [data, setData] = useState<OrganizationInput>({
    name: "",
  });

  const { slug } = useParams();

  const { mutate, isPending, isError } = useCreateOrganization();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const router = useRouter();

  const createOrganization = () => {
    mutate(data, {
      onSuccess: () => {
        router.push(`/organization/${slug}/dashboard`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Workspace Setup
          </span>
        </div>

        {/* Card */}
        <Card className="border  border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-3 pb-6">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
              <Building2 className="h-6 w-6 text-teal-400" />
            </div>

            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-semibold tracking-tight text-white">
                Create your organization
              </CardTitle>
              <CardDescription className="text-sm text-white/40 leading-relaxed">
                Give your team a home. Collaborate, manage projects, and ship
                faster together.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Input */}
            <div className="space-y-2">
              <Label className="text-xs font-medium tracking-wide text-white/50 uppercase">
                Organization Name
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={data.name}
                  name="name"
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:border-teal-500/50 focus-visible:ring-teal-500/20 h-11 transition-all duration-200"
                />
                {data.name.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/20 font-mono">
                    {data.name.length}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

            {/* URL preview */}
            {/* {orgName && (
              <div className="rounded-lg border border-teal-500/15 bg-teal-500/5 px-4 py-3">
                <p className="text-xs text-white/30 mb-1 font-mono uppercase tracking-wider">
                  Your workspace URL
                </p>
                <p className="text-sm font-mono text-teal-400/80">
                  app.acme.com/
                  <span className="text-teal-300">
                    {orgName.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </p>
              </div>
            )} */}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => createOrganization()}
              disabled={data.name.trim().length === 0}
              className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold tracking-wide transition-all duration-200 disabled:bg-white/5 disabled:text-white/20 disabled:border disabled:border-white/10 group"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>

            <p className="text-center text-xs text-white/25">
              Already have an organization?{" "}
              <Link
                href="/login"
                className="text-teal-400/70 hover:text-teal-300 underline underline-offset-2 transition-colors duration-150"
              >
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Organization;
