"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [data, setData] = useState();


  useEffect(() => {
    async function fetchdata() {
      const res = await axios.get("http://localhost:5000");
      console.log(res.data);
      setData(res.data);
    }
    fetchdata();
  }, []);

  console.log("data: ", data);

  return (
    <div>
      <h1 className="text-4xl font-bold">{data}</h1>
    </div>
  );
}
