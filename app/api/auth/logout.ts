export default function handler(req: any, res: any) {
  res.setHeader(
    "Set-Cookie",
    `bloxion_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
  res.status(200).json({ success: true });
}
