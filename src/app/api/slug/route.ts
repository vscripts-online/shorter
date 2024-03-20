import cookie from "cookie";
import crypto from "node:crypto";
import connectMongoose from "@/server/database/mongoose";
import connectRedis from "@/server/database/redis";
import { IShortOutput } from "@/server/type";
import { NextRequest, NextResponse as Response } from "next/server";
import clickModel from "@/server/model/click.model";
import shortModel from "@/server/model/short.model";

export const dynamic = "force-dynamic";

const Click = clickModel();
const Short = shortModel();

export async function GET(request: NextRequest) {
  await connectRedis();
  await connectMongoose();

  const slug = request.nextUrl.pathname.slice(1);

  const _short = await global.redisClient.getSlug(slug);
  if (!_short) {
    return Response.json({ error: "NOT FOUND" }, { status: 404 });
  }

  const short = JSON.parse(_short) as IShortOutput;
  const headers = new Headers();
  headers.set("Cache-Control", "no-cache");

  const request_headers = Object.fromEntries(request.headers.entries());
  const cookies = cookie.parse(request_headers.cookie || "");

  const click = new Click({
    ip: request_headers["x-forwarded-for"],
    referer: request_headers["referer"],
    user_agent: request_headers["user-agent"],
    short: short._id,
    tracking: cookies.tracking,
  });

  click.save();

  Short.updateOne({ _id: short._id }, { $inc: { clicked: 1 } }).exec();

  return Response.redirect(short.real_url, { headers });
}
