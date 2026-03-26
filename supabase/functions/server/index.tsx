import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-6b47184d/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ROUTES ==========
app.post("/make-server-6b47184d/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user info in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ========== REQUEST ROUTES ==========
app.post("/make-server-6b47184d/requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productName, budget, location, deliveryTime } = await c.req.json();
    
    const requestId = crypto.randomUUID();
    const newRequest = {
      id: requestId,
      customerId: user.id,
      productName,
      budget,
      location,
      deliveryTime,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    await kv.set(`request:${requestId}`, newRequest);
    
    // Add to requests list
    const requests = await kv.get('requests') || [];
    requests.push(requestId);
    await kv.set('requests', requests);

    return c.json({ request: newRequest });
  } catch (error) {
    console.log(`Create request error: ${error}`);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

app.get("/make-server-6b47184d/requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const requestIds = await kv.get('requests') || [];
    const requests = [];

    for (const id of requestIds) {
      const request = await kv.get(`request:${id}`);
      if (request) {
        requests.push(request);
      }
    }

    // Filter based on user role
    const userData = await kv.get(`user:${user.id}`);
    let filteredRequests = requests;
    
    if (userData?.role === 'customer') {
      filteredRequests = requests.filter(r => r.customerId === user.id);
    }

    return c.json({ requests: filteredRequests });
  } catch (error) {
    console.log(`Get requests error: ${error}`);
    return c.json({ error: "Failed to get requests" }, 500);
  }
});

app.get("/make-server-6b47184d/requests/:id", async (c) => {
  try {
    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);
    
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    return c.json({ request });
  } catch (error) {
    console.log(`Get request error: ${error}`);
    return c.json({ error: "Failed to get request" }, 500);
  }
});

// ========== OFFER ROUTES ==========
app.post("/make-server-6b47184d/offers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { requestId, price, deliveryTime } = await c.req.json();
    
    const offerId = crypto.randomUUID();
    const vendorData = await kv.get(`user:${user.id}`);
    
    const newOffer = {
      id: offerId,
      requestId,
      vendorId: user.id,
      vendorName: vendorData?.name || 'Unknown Vendor',
      price,
      deliveryTime,
      createdAt: new Date().toISOString()
    };

    await kv.set(`offer:${offerId}`, newOffer);
    
    // Add to request's offers
    const offers = await kv.get(`offers:${requestId}`) || [];
    offers.push(offerId);
    await kv.set(`offers:${requestId}`, offers);

    return c.json({ offer: newOffer });
  } catch (error) {
    console.log(`Create offer error: ${error}`);
    return c.json({ error: "Failed to create offer" }, 500);
  }
});

app.get("/make-server-6b47184d/offers/:requestId", async (c) => {
  try {
    const requestId = c.req.param('requestId');
    const offerIds = await kv.get(`offers:${requestId}`) || [];
    const offers = [];

    for (const id of offerIds) {
      const offer = await kv.get(`offer:${id}`);
      if (offer) {
        offers.push(offer);
      }
    }

    return c.json({ offers });
  } catch (error) {
    console.log(`Get offers error: ${error}`);
    return c.json({ error: "Failed to get offers" }, 500);
  }
});

// ========== ORDER ROUTES ==========
app.post("/make-server-6b47184d/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { requestId, offerId } = await c.req.json();
    
    const offer = await kv.get(`offer:${offerId}`);
    const request = await kv.get(`request:${requestId}`);
    
    if (!offer || !request) {
      return c.json({ error: 'Offer or request not found' }, 404);
    }

    const orderId = crypto.randomUUID();
    const newOrder = {
      id: orderId,
      requestId,
      offerId,
      customerId: request.customerId,
      vendorId: offer.vendorId,
      riderId: null,
      status: 'vendor_accepted',
      productName: request.productName,
      price: offer.price,
      location: request.location,
      deliveryTime: offer.deliveryTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, newOrder);
    
    // Update request status
    request.status = 'accepted';
    await kv.set(`request:${requestId}`, request);

    // Add to user's orders
    const userOrders = await kv.get(`orders:user:${user.id}`) || [];
    userOrders.push(orderId);
    await kv.set(`orders:user:${user.id}`, userOrders);

    return c.json({ order: newOrder });
  } catch (error) {
    console.log(`Create order error: ${error}`);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

app.get("/make-server-6b47184d/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderIds = await kv.get(`orders:user:${user.id}`) || [];
    const orders = [];

    for (const id of orderIds) {
      const order = await kv.get(`order:${id}`);
      if (order) {
        orders.push(order);
      }
    }

    return c.json({ orders });
  } catch (error) {
    console.log(`Get orders error: ${error}`);
    return c.json({ error: "Failed to get orders" }, 500);
  }
});

app.get("/make-server-6b47184d/orders/:id", async (c) => {
  try {
    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json({ order });
  } catch (error) {
    console.log(`Get order error: ${error}`);
    return c.json({ error: "Failed to get order" }, 500);
  }
});

app.put("/make-server-6b47184d/orders/:id/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const { status, riderId } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    if (riderId) {
      order.riderId = riderId;
      // Add to rider's jobs
      const riderOrders = await kv.get(`orders:rider:${riderId}`) || [];
      if (!riderOrders.includes(orderId)) {
        riderOrders.push(orderId);
        await kv.set(`orders:rider:${riderId}`, riderOrders);
      }
    }

    await kv.set(`order:${orderId}`, order);

    return c.json({ order });
  } catch (error) {
    console.log(`Update order status error: ${error}`);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

app.get("/make-server-6b47184d/rider/jobs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all open orders (without riders)
    const requestIds = await kv.get('requests') || [];
    const openOrders = [];
    const myOrders = [];

    // Get rider's assigned orders
    const riderOrderIds = await kv.get(`orders:rider:${user.id}`) || [];
    
    for (const orderId of riderOrderIds) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        myOrders.push(order);
      }
    }

    // Get all orders to find unassigned ones
    for (const reqId of requestIds) {
      const request = await kv.get(`request:${reqId}`);
      if (request?.status === 'accepted') {
        // Find associated order
        const offerIds = await kv.get(`offers:${reqId}`) || [];
        for (const offerId of offerIds) {
          const orderKey = await findOrderByOfferId(offerId);
          if (orderKey) {
            const order = await kv.get(orderKey);
            if (order && !order.riderId && order.status === 'vendor_accepted') {
              openOrders.push(order);
            }
          }
        }
      }
    }

    return c.json({ openJobs: openOrders, myJobs: myOrders });
  } catch (error) {
    console.log(`Get rider jobs error: ${error}`);
    return c.json({ error: "Failed to get rider jobs" }, 500);
  }
});

// Helper function to find order by offer ID
async function findOrderByOfferId(offerId: string) {
  const requestIds = await kv.get('requests') || [];
  for (const reqId of requestIds) {
    const request = await kv.get(`request:${reqId}`);
    if (request) {
      // Try to find order for this request
      const orderKey = `order:${request.id}`;
      const order = await kv.get(orderKey);
      if (order && order.offerId === offerId) {
        return orderKey;
      }
    }
  }
  return null;
}

Deno.serve(app.fetch);