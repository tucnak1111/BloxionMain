import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!;
  const REDIRECT_URI = process.env.ROBLOX_REDIRECT_URI!;
  const STATE = crypto.randomUUID();

  const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${ROBLOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile&state=${STATE}`;

  res.redirect(authUrl);
}