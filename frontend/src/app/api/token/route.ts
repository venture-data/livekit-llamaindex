import { generateRandomAlphanumeric } from "@/lib/util";
import { NextResponse } from "next/server";

import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { AccessToken } from "livekit-server-sdk";
import { TokenResult } from "@/lib/types";

const apiKey = process.env.LK_API_KEY;
const apiSecret = process.env.LK_API_SECRET;

// Function to create the token
const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

export async function GET() {
  try {
    if (!apiKey || !apiSecret) {
      return new NextResponse(
        "Environment variables aren't set up correctly",
        { status: 500 }
      );
    }

    const roomName = `cartesia-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;
    const identity = `user-${generateRandomAlphanumeric(4)}`;

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    };

    // Create the token
    const token = await createToken({ identity }, grant);
    const result: TokenResult = {
      identity,
      accessToken: token,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 500 });
  }
}
