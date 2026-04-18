// Helper function to get consistent cookie configuration
export const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProduction, // true in production, false in development
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
  };
};
