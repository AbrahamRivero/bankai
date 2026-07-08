import { client } from "@kaneo/libs";

export type CustomersInsights = {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  topBuyers: {
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }[];
  byProvince: { province: string; count: number }[];
};

async function getCustomersInsights(workspaceId: string, period?: string) {
  const query: Record<string, string> = { workspaceId };
  if (period) query.period = period;

  const response = await client.customers.insights.$get({ query });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<CustomersInsights>;
}

export default getCustomersInsights;
