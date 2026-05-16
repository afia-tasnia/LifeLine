import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("Password123!", 10);
console.log(hash);