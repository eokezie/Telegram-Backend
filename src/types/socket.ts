export interface CallRequestPayload {
  chatRoomId: string;
  signalData: any;
  userId: string;
  callType: "audio" | "video";
}

export type AcknowledgementFn = (response: boolean) => void;
