import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.js";
import { generateUniqueSlug } from "../controllers/organization.controller.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.REDIRECT_URI!,
      scope: ["profile", "email"],
    },
    async function verify(accessToken, refreshToken, profile, done) {
      try {
        // check if user already exist
        let user = await prisma.user.findUnique({
          where: {
            googleId: profile.id,
          },
        });

        // if user not exist
        if (!user) {
          const email = profile.emails?.[0]?.value || "";
          const name = profile.displayName;

          const defaultOrganizationName = `${name}'s Organization`;
          const slug = await generateUniqueSlug(defaultOrganizationName);

          user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                googleId: profile.id,
                name,
                email,
              },
            });

            await tx.organization.create({
              data: {
                name: defaultOrganizationName,
                slug,
                members: {
                  create: {
                    userId: newUser.id,
                    role: "OWNER",
                  },
                },
              },
            });

            return newUser;
          });
        }

        return done(null, user);
      } catch (error) {
        console.error(`error in passport configuration : ${error}`);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) return done(null, false);

    const transformedUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
    } as any;

    done(null, transformedUser);
  } catch (error) {
    done(error);
  }
});

export default passport;
