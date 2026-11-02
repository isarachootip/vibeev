import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VOLTCHARGE - EV Smart Charging & LINE Service",
    short_name: "VOLTCHARGE",
    description:
      "แอปพลิเคชันชาร์จรถยนต์ไฟฟ้าอัจฉริยะ รองรับ LINE LIFF, ชำระเงิน PromptPay และระบบแจ้งปัญหาผ่าน LINE Official Account",
    start_url: "/",
    display: "standalone",
    background_color: "#07080e",
    theme_color: "#06b6d4",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
