import "@babel/polyfill";
import "isomorphic-fetch";

import Shopify, { ApiVersion } from "@shopify/shopify-api";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import { getSubscriptionUrl, createClient } from "./handlers";
import Cryptr from "cryptr";
import Koa from "koa";
import Router from "koa-router";
import dotenv from "dotenv";
import mongoose from "mongoose";
import next from "next";
import { webhooks } from "../webhooks/index.js";

const sessionStorage = require("./../utils/sessionStorage.js");
const SessionModel = require("./../models/SessionModel.js");
const ShopModel = require("./../models/ShopModel.js");

const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/shopify-app";

mongoose.connect(
    mongoUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.log("--> There was an error connecting to MongoDB:", err.message);
      } else {
        console.log("--> Connected to MongoDB");
      }
    }
  );
  

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\/|\/$/g, ""),
  API_VERSION: "2022-01",
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: sessionStorage,
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

for (const webhook of webhooks) {
  Shopify.Webhooks.Registry.webhookRegistry.push({
    path: webhook.path,
    topic: webhook.topic,
    webhookHandler: webhook.webhookHandler,
  });
}

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }
        server.context.client = await createClient(shop, accessToken);
        await getSubscriptionUrl(ctx, shop, host);
        // Redirect to app with shop parameter upon auth ctx.redirect(`/?shop=${shop}&host=${host}`);
        
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    //console.log(`> Ready on http://localhost:${port}`);
  });
});
