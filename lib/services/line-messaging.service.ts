import type { IssueTicket } from "../validations/ticket.schema";

export interface LineDispatchResult {
  dispatchedViaApi: boolean;
  previewMessage: string;
}

export class LineMessagingService {
  private readonly channelAccessToken =
    process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
  private readonly adminTargetId = process.env.LINE_ADMIN_TARGET_ID ?? "";

  async sendIssueCreatedAlert(ticket: IssueTicket): Promise<LineDispatchResult> {
    if (!this.channelAccessToken || !this.adminTargetId) {
      return {
        dispatchedViaApi: false,
        previewMessage: ticket.lineNotificationPreview,
      };
    }

    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify({
          to: this.adminTargetId,
          messages: [{ type: "text", text: ticket.lineNotificationPreview }],
        }),
      });
      return {
        dispatchedViaApi: response.ok,
        previewMessage: ticket.lineNotificationPreview,
      };
    } catch {
      return {
        dispatchedViaApi: false,
        previewMessage: ticket.lineNotificationPreview,
      };
    }
  }

  async sendTicketResolvedReply(ticket: IssueTicket): Promise<LineDispatchResult> {
    const replyText = `✅ [VOLTCHARGE LINE OA] เคส #${ticket.id} (ตู้ ${
      ticket.chargerId
    }) ได้รับการแก้ไขเรียบร้อยแล้ว: "${
      ticket.resolutionNote ?? "พร้อมให้บริการตามปกติ"
    }"`;

    if (
      !this.channelAccessToken ||
      !ticket.lineUserId ||
      ticket.lineUserId.startsWith("U-LINE-")
    ) {
      return { dispatchedViaApi: false, previewMessage: replyText };
    }

    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify({
          to: ticket.lineUserId,
          messages: [{ type: "text", text: replyText }],
        }),
      });
      return { dispatchedViaApi: response.ok, previewMessage: replyText };
    } catch {
      return { dispatchedViaApi: false, previewMessage: replyText };
    }
  }
}

export const lineMessagingService = new LineMessagingService();
