"use client"

import { useOrganization } from '@/hooks/organization/useOrganization'
import { useParams } from 'next/navigation'
import React from 'react'

const MyOrganization = () => {
  const params = useParams()
  const slug = params.slug as string;
  const { data , isPending , error } = useOrganization(slug)

  console.log("name: " , data)

  return (
    <div>
       <h1>{data?.name}</h1>
    </div>
  )
}

export default MyOrganization