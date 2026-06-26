import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai pembersihan database...");
  const pointDelete = await prisma.waterPoint.deleteMany();
  const userDelete = await prisma.user.deleteMany();
  const guestDelete = await prisma.guest.deleteMany();
  console.log(`Pembersihan database selesai. Berhasil menghapus ${pointDelete.count} data sampel, ${userDelete.count} user, dan ${guestDelete.count} guest.`);
  
  console.log("Membuat default user...");
  const defaultUser = await prisma.user.create({
    data: {
      name: "Admin Dinas LH",
      email: "admin.lh@jakarta.go.id",
      role: "admin",
    },
  });
  console.log(`Default user berhasil dibuat: ${defaultUser.name} (${defaultUser.email})`);
}

main()
  .catch((e) => {
    console.error("Gagal melakukan pembersihan database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
