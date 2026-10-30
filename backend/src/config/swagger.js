import swaggerJsdoc from "swagger-jsdoc";

class SwaggerConfig {
  constructor() {
    this.spec = swaggerJsdoc({
      definition: {
        openapi: "3.0.3",
        info: {
          title: "Amanat API",
          version: "1.0.0",
          description:
            "Ota-onalar farzandlariga ma'lum maqsad uchun bergan pulini kuzatib borish uchun platforma backend API'si.",
        },
        // Nisbiy URL — Swagger UI qaysi domen/portda ochilgan bo'lsa, so'rovlar
        // ham o'sha serverga ketadi (lokal va production'da bir xil ishlaydi).
        servers: [{ url: "/api" }],
        components: {
          securitySchemes: {
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "accessToken",
            },
          },
        },
      },
      apis: ["./src/modules/**/*.routes.js"],
    });
  }
}

export const swaggerConfig = new SwaggerConfig();
