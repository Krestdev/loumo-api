import axios, { AxiosInstance } from "axios";
import { config } from "../configs";

interface Recipient {
  type: "MSISDN";
  address: {
    value: string;
  };
}

interface PayoutRequest {
  payoutId?: string;
  status?: string;
  amount: string;
  currency: string;
  country: string;
  correspondent: string;
  recipient: Recipient;
  customerTimestamp: string;
  statementDescription?: string;
  metadata?: Record<string, string>;
  receivedByRecipient?: string;
  correspondentIds?: Record<string, string>;
  created: string;
}

interface ResendRequest {
  payoutId: string;
  status: string;
  rejectionReason?: string;
}

export class PawapayService {
  private client: AxiosInstance;
  private baseUrl: string;
  private authToken: string;

  constructor() {
    this.baseUrl = config.PAWAPAY.BASE_URL || "https://api.sandbox.pawapay.io";
    this.authToken = config.PAWAPAY.API_TOKEN || "";
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Request a new payout
   */
  public async requestPayout(data: PayoutRequest): Promise<{
    payoutId: string;
    status: string;
    created: string;
    rejectionReason?: {
      rejectionCode: string;
      rejectionMessage: string;
    };
  }> {
    const response = await this.client.post("/payouts", data);
    return response.data;
  }

  /**
   * Check the status of an existing payout
   */
  public async checkPayoutStatus(payoutId: string): Promise<PayoutRequest[]> {
    const response = await this.client.get(`/payouts/${payoutId}`);
    return response.data;
  }

  /**
   * Resend payout callback (for recovery or manual retries)
   */
  public async resendPayoutCallback(payoutId: string): Promise<ResendRequest> {
    const response = await this.client.post(
      `/payouts/${payoutId}/resend-callback`
    );
    return response.data;
  }

  /**
   * Cancel a payout (only works for ENQUEUED status)
   */
  public async cancelPayout(payoutId: string): Promise<ResendRequest> {
    const response = await this.client.post(`/payouts/${payoutId}/cancel`);
    return response.data;
  }
}
