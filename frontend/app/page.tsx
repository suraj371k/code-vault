"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useProfile } from "@/hooks/auth/useProfile";

export default function Home() {

  const { data } = useProfile()

  console.log(data?.name)


  return (
    <div>
      <h1 className="text-4xl text-white font-bold">{data?.name}</h1>
    </div>
  );
}
