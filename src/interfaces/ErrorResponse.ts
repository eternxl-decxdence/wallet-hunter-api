import MessageResponse from "./MessageResponse.ts";

export default interface ErrorResponse extends MessageResponse {
  stack?: string;
}
