import jwt from "jsonwebtoken";

export function makeToken(customerRow) {
  return jwt.sign(
    {
      customer_id: customerRow.customer_id,
      email: customerRow.email,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

export function requireCustomerAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.customer_id = decoded.customer_id;
  next();
}
