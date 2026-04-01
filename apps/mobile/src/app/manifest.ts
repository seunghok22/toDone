import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "toDone — Task Manager",
    short_name: "toDone",
    description: "Your daily companion for task management. Sync across desktop and mobile.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#131315",
    theme_color: "#131315",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add Task",
        short_name: "Add",
        url: "/?action=add",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
