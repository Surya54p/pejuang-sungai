// Safe types and utility functions for water monitoring

export interface Point {
  id: number;
  title: string;
  location: string; // Kecamatan
  reporter: string;
  datetime: string;
  type: "bersih" | "limbah";
  ph: number;
  temp: number;
  turbidity: number;
  tds: number;
  tss: number;
  do_level: number;
  bod: number;
  cod: number;
  ecoli: number;
  coliform: number;
  klorin: number;
  besi: number;
  pb: number; // Lead/Timbal
  merkuri: number;
  nitrat: number;
  photo: string;
  position: [number, number];
}

// Standard water quality limits helper
export function checkPointStatus(point: Partial<Point> & { type: "bersih" | "limbah"; ph: number; pb: number; bod?: number; cod?: number; turbidity?: number }) {
  const exceeds: string[] = [];
  const { type, ph, pb, bod = 0, cod = 0, turbidity = 0 } = point;

  if (type === "bersih") {
    // Air Bersih thresholds (Permenkes or similar standard)
    if (ph < 6.5 || ph > 8.5) exceeds.push("pH");
    if (pb > 0.03) exceeds.push("Pb (Timbal)");
    if (bod > 3.0) exceeds.push("BOD");
    if (cod > 10.0) exceeds.push("COD");
    if (turbidity > 25) exceeds.push("Kekeruhan");
  } else {
    // Air Limbah thresholds (Got / domestic wastewater standard)
    if (ph < 6.0 || ph > 9.0) exceeds.push("pH");
    if (pb > 0.10) exceeds.push("Pb (Timbal)");
    if (bod > 30.0) exceeds.push("BOD");
    if (cod > 100.0) exceeds.push("COD");
    if (turbidity > 50) exceeds.push("Kekeruhan");
  }

  const isExceeding = exceeds.length > 0;
  let status: "Aman" | "Waspada" | "Bahaya" = "Aman";
  if (isExceeding) {
    status = exceeds.length <= 2 ? "Waspada" : "Bahaya";
  }

  return {
    isExceeding,
    exceededParams: exceeds,
    status,
  };
}
