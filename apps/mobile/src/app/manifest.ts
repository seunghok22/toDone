import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "toDone Mobile",
    short_name: "toDone",
    description: "Your daily companion for task management",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#131315",
    theme_color: "#131315",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
