import db from "../db.server";

export const loader = async () => {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const action = async ({ request }) => {
  // Handle CORS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { 
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const data = await request.json();
    const { shop, configId, eventType, deviceType, country } = data;

    if (!shop || !configId || !eventType || !deviceType) {
      return Response.json({ error: "Missing required fields" }, { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    const event = await db.analyticsEvent.create({
      data: {
        shop,
        configId,
        eventType,
        deviceType: deviceType.toUpperCase(),
        country: country?.toUpperCase() || "UNKNOWN",
      },
    });

    return Response.json({ success: true, eventId: event.id }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error) {
    console.error("Error creating analytics event:", error);
    return Response.json({ error: "Internal Server Error" }, { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }
};
