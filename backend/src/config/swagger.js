import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

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
        servers: [{ url: `http://localhost:${env.port}/api`, description: "Local server" }],
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
