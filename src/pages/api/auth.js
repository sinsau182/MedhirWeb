import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export default NextAuth({
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const client = await connectToDatabase();
        const usersCollection = client.db().collection("users");
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found!");
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password!");
        }

        return { email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session(session, user) {
      session.user.role = user.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});