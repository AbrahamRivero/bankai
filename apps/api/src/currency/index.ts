import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";
import getCurrencies from "./controllers/get-currencies";

const currency = new Hono().get(
  "/",
  describeRoute({
    operationId: "getCurrencies",
    tags: ["Store"],
    description: "Get current currency exchange rates",
    responses: {
      200: {
        description: "Currency rates",
        content: {
          "application/json": { schema: resolver(v.any()) },
        },
      },
    },
  }),
  async (c) => {
    const result = await getCurrencies();
    return c.json(result);
  },
);

export default currency;
