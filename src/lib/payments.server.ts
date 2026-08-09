/**
 * Payment provider abstraction.
 *
 * NOTE: these are MOCK adapters. No real money moves. Swapping in a live
 * M-Pesa Daraja / card processor means implementing this interface and
 * registering it below — no order-engine changes required.
 */

export type ChargeInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  reference?: string | undefined;
};

export type ChargeResult = {
  status: "paid" | "processing" | "failed";
  providerRef: string;
  failureReason?: string;
  metadata: Record<string, unknown>;
};

export interface PaymentProvider {
  id: string;
  label: string;
  isMock: boolean;
  charge(input: ChargeInput): Promise<ChargeResult>;
}

function ref(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

const mpesaMock: PaymentProvider = {
  id: "mpesa_mock",
  label: "M-Pesa (mock)",
  isMock: true,
  async charge(input) {
    const phone = (input.reference ?? "").replace(/\s+/g, "");
    if (!/^(?:\+?254|0)7\d{8}$/.test(phone)) {
      return {
        status: "failed",
        providerRef: ref("MPESA"),
        failureReason: "Enter a valid Safaricom number, e.g. 0712345678.",
        metadata: { adapter: "mock", phone },
      };
    }
    return {
      status: "paid",
      providerRef: ref("MPESA"),
      metadata: { adapter: "mock", phone, simulated: true },
    };
  },
};

const cardMock: PaymentProvider = {
  id: "card_mock",
  label: "Card (mock)",
  isMock: true,
  async charge(input) {
    return {
      status: "paid",
      providerRef: ref("CARD"),
      metadata: { adapter: "mock", simulated: true, amount: input.amount },
    };
  },
};

const invoiceAccount: PaymentProvider = {
  id: "invoice",
  label: "Corporate invoice",
  isMock: true,
  async charge() {
    return {
      status: "processing",
      providerRef: ref("INV"),
      metadata: { adapter: "mock", terms: "net_30" },
    };
  },
};

const providers: Record<string, PaymentProvider> = {
  [mpesaMock.id]: mpesaMock,
  [cardMock.id]: cardMock,
  [invoiceAccount.id]: invoiceAccount,
};

export function getPaymentProvider(id: string): PaymentProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}
