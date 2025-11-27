export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Fenix Streaming API",
    description: "API for Fenix streaming platform - manage content, users, and subscriptions",
    version: "1.0.0",
    contact: {
      name: "Fenix Support",
      url: "https://fenix.streaming",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
    {
      url: "https://api.fenix.streaming",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token for authentication",
      },
    },
    schemas: {
      Movie: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          genre: { type: "string" },
          year: { type: "integer" },
          description: { type: "string" },
          cast: { type: "array", items: { type: "string" } },
          status: { type: "string", enum: ["draft", "active", "archived"] },
          requiredPlan: { type: "string", enum: ["free", "standard", "premium"] },
          videoUrl: { type: "string" },
          posterUrl: { type: "string" },
          duration: { type: "integer" },
          views: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Series: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          genre: { type: "string" },
          totalSeasons: { type: "integer" },
          description: { type: "string" },
          cast: { type: "array", items: { type: "string" } },
          status: { type: "string", enum: ["draft", "active", "archived"] },
          requiredPlan: { type: "string", enum: ["free", "standard", "premium"] },
          posterUrl: { type: "string" },
          rating: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          plan: { type: "string", enum: ["free", "standard", "premium"] },
          status: { type: "string", enum: ["active", "suspended", "banned"] },
          joinedAt: { type: "string", format: "date-time" },
        },
      },
      AuthToken: {
        type: "object",
        properties: {
          token: { type: "string" },
          expiresIn: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/users/register": {
      post: {
        summary: "Register new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  passwordHash: { type: "string" },
                  plan: { type: "string", default: "free" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Invalid input or email already registered" },
        },
      },
    },
    "/api/public/movies": {
      get: {
        summary: "Get available movies for user plan",
        tags: ["Content"],
        parameters: [
          {
            name: "plan",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["free", "standard", "premium"] },
          },
        ],
        responses: {
          200: {
            description: "List of accessible movies",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Movie" } },
              },
            },
          },
        },
      },
    },
    "/api/public/series": {
      get: {
        summary: "Get available series for user plan",
        tags: ["Content"],
        parameters: [
          {
            name: "plan",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["free", "standard", "premium"] },
          },
        ],
        responses: {
          200: {
            description: "List of accessible series",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Series" } },
              },
            },
          },
        },
      },
    },
    "/api/content/{type}/{id}/access": {
      get: {
        summary: "Check content access and get streaming URL",
        tags: ["Content"],
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            schema: { type: "string", enum: ["movie", "series"] },
          },
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "plan",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["free", "standard", "premium"] },
          },
        ],
        responses: {
          200: {
            description: "Access check result with optional streaming URL",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    title: { type: "string" },
                    accessible: { type: "boolean" },
                    requiredPlan: { type: "string" },
                    videoUrl: { type: "string" },
                  },
                },
              },
            },
          },
          404: { description: "Content not found" },
        },
      },
    },
    "/api/users": {
      get: {
        summary: "Get all users (admin only)",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/User" } },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        summary: "Get user details",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User details", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
        },
      },
      patch: {
        summary: "Update user",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User updated" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/movies/search": {
      get: {
        summary: "Search movies with filters",
        tags: ["Content"],
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Search query (title or description)",
          },
          {
            name: "genre",
            in: "query",
            schema: { type: "string" },
            description: "Filter by genre",
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["draft", "active", "archived"] },
            description: "Filter by status",
          },
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Movie" } },
              },
            },
          },
        },
      },
    },
    "/api/channels/{channelId}/content": {
      get: {
        summary: "Get content in channel",
        tags: ["Channels"],
        parameters: [
          {
            name: "channelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Channel content",
            content: {
              "application/json": {
                schema: { type: "array" },
              },
            },
          },
        },
      },
      post: {
        summary: "Add content to channel",
        tags: ["Channels"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "channelId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  contentType: { type: "string", enum: ["movie", "series"] },
                  contentId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Content added" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};
