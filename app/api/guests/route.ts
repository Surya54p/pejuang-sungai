import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guestName = body.name;
    if (!guestName || !guestName.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    const guest = await prisma.guest.upsert({
      where: { name: guestName.trim() },
      update: {},
      create: {
        name: guestName.trim(),
        role: "tamu",
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan data tamu:", error);
    return NextResponse.json({ error: "Gagal menyimpan data ke database" }, { status: 500 });
  }
}
