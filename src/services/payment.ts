import axios, { AxiosInstance } from "axios";
import { config } from "../configs";

interface PayoutRequest {
  depositId: string;
  payer: {
    type: string;
    accountDetails: {
      phoneNumber: string;
      provider: string;
    };
  };
  clientReferenceId: string;
  amount: string;
  currency: string;
}

type DepositStatus = "COMPLETED" | "ACCEPTED" | "IN_RECONCILIATION" | "FAILED";

type DepositData = {
  depositId: string;
  status: DepositStatus;
  amount: string;
  currency: string;
  country: string;
  payer: {
    type: string;
    accountDetails: {
      phoneNUmber: string;
      provider: string;
    };
  };
  customerMessage: string;
  clientReferenceId: string;
  created: string;
  providerTransactionId?: string; // Only appears in some cases
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
  metadata: {
    orderId: string;
    customerId: string;
  };
};

type ApiResponse = {
  status: "FOUND";
  data?: DepositData;
};

type FailureReason = {
  failureCode: string;
  failureMessage: string;
};

type DepositSimpleResponse =
  | {
      depositId: string;
      status: "REJECTED";
      failureReason: FailureReason;
    }
  | {
      depositId: string;
      status: "ACCEPTED";
    };

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
    this.baseUrl =
      config.PAWAPAY.BASE_URL || "https://api.sandbox.pawapay.io/v2";
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
  public async requestPayout(
    data: PayoutRequest
  ): Promise<DepositSimpleResponse> {
    const response = await this.client.post("/deposits", data);
    return response.data;
  }

  /**
   * Check the status of an existing payout
   */
  public async checkDepositstatus(payoutId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/deposits/${payoutId}`);
    return response.data;
  }

  /**
   * Resend payout callback (for recovery or manual retries)
   */
  public async resendPayoutCallback(payoutId: string): Promise<ResendRequest> {
    const response = await this.client.post(
      `/deposits/${payoutId}/resend-callback`
    );
    return response.data;
  }

  /**
   * Cancel a payout (only works for ENQUEUED status)
   */
  public async cancelPayout(payoutId: string): Promise<ResendRequest> {
    const response = await this.client.post(`/deposits/${payoutId}/cancel`);
    return response.data;
  }
}
