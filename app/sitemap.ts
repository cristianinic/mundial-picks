import { MetadataRoute } from "next";

const baseUrl = "https://mundialpicks2026.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/calendario",
    "/como-se-puntua",
    "/datos-formidables",
    "/inscripcion",
    "/pago",
    "/picks",
    "/privacidad",
    "/ranking",
    "/terminos",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}