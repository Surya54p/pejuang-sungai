import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const formatDatetime = (date: Date) => {
  try {
    const day = date.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch (e) {
    return date.toLocaleString("id-ID");
  }
};

export async function GET() {
  try {
    const dbPoints = await prisma.waterPoint.findMany({
      orderBy: {
        datetime: "desc",
      },
      include: {
        reporter: true,
        guest: true,
      },
    });

    const points = dbPoints.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      reporter: p.reporter?.name || p.guest?.name || "Unknown",
      datetime: formatDatetime(p.datetime),
      type: p.type as "bersih" | "limbah",
      ph: p.ph,
      temp: p.temp,
      turbidity: p.turbidity,
      tds: p.tds,
      tss: p.tss,
      do_level: p.do_level,
      bod: p.bod,
      cod: p.cod,
      ecoli: p.ecoli,
      coliform: p.coliform,
      klorin: p.klorin,
      besi: p.besi,
      pb: p.pb,
      merkuri: p.merkuri,
      nitrat: p.nitrat,
      photo: p.photo,
      position: [p.latitude, p.longitude] as [number, number],
    }));

    return NextResponse.json(points);
  } catch (error: any) {
    console.error("Gagal memuat data titik sampel:", error);
    return NextResponse.json({ error: "Gagal memuat data titik sampel dari database" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Find or create the reporter depending on role
    const reporterName = body.reporter || "Admin Dinas LH";
    const reporterRole = body.reporterRole || "admin";
    
    let reporterId: number | null = null;
    let guestId: number | null = null;

    if (reporterRole === "admin") {
      const user = await prisma.user.upsert({
        where: { name: reporterName },
        update: {},
        create: {
          name: reporterName,
          email: `${reporterName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          role: "petugas",
        },
      });
      reporterId = user.id;
    } else {
      const guest = await prisma.guest.upsert({
        where: { name: reporterName },
        update: {},
        create: {
          name: reporterName,
          role: "tamu",
        },
      });
      guestId = guest.id;
    }

    // Create new record
    const p = await prisma.waterPoint.create({
      data: {
        title: body.title,
        location: body.location,
        reporterId: reporterId,
        guestId: guestId,
        type: body.type,
        ph: parseFloat(body.ph),
        temp: parseFloat(body.temp),
        turbidity: parseFloat(body.turbidity),
        tds: parseInt(body.tds),
        tss: parseInt(body.tss),
        do_level: parseFloat(body.do_level),
        bod: parseFloat(body.bod),
        cod: parseFloat(body.cod),
        ecoli: parseInt(body.ecoli),
        coliform: parseInt(body.coliform),
        klorin: parseFloat(body.klorin),
        besi: parseFloat(body.besi),
        pb: parseFloat(body.pb),
        merkuri: parseFloat(body.merkuri),
        nitrat: parseFloat(body.nitrat),
        photo: body.photo,
        latitude: parseFloat(body.position[0]),
        longitude: parseFloat(body.position[1]),
      },
      include: {
        reporter: true,
        guest: true,
      },
    });

    const createdPoint = {
      id: p.id,
      title: p.title,
      location: p.location,
      reporter: p.reporter?.name || p.guest?.name || reporterName,
      datetime: formatDatetime(p.datetime),
      type: p.type as "bersih" | "limbah",
      ph: p.ph,
      temp: p.temp,
      turbidity: p.turbidity,
      tds: p.tds,
      tss: p.tss,
      do_level: p.do_level,
      bod: p.bod,
      cod: p.cod,
      ecoli: p.ecoli,
      coliform: p.coliform,
      klorin: p.klorin,
      besi: p.besi,
      pb: p.pb,
      merkuri: p.merkuri,
      nitrat: p.nitrat,
      photo: p.photo,
      position: [p.latitude, p.longitude] as [number, number],
    };

    return NextResponse.json(createdPoint, { status: 201 });
  } catch (error: any) {
    console.error("Gagal menambahkan data titik sampel:", error);
    return NextResponse.json({ error: "Gagal menyimpan data ke database" }, { status: 500 });
  }
}
