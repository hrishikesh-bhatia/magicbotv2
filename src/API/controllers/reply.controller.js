import { handleReply } from "../../ENGINE/ReplyHandler.js";

export const replyController = (req, res) => {
  const decision = handleReply(req.body);
  return res.json(decision);
};