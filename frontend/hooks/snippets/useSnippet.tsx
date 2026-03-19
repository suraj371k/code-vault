"use client"

import { api } from "@/lib/api"
import { Snippet } from "@/types/snippets"
import { useQuery } from "@tanstack/react-query"


export const useSnippet = (snippetId: number) => {
    return useQuery<Snippet, Error>({
        queryKey: ['snippet-detail', snippetId],
        queryFn: async () => {
            const res = await api.get(`/api/snippets/${snippetId}`)
            return res.data.data
        }
    })
}