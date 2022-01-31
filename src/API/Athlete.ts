import { Athlete } from "../models/Athlete";
import { TerraUser } from "../models/TerraUser";
import TerraError from "./TerraError";
import fetch from "cross-fetch";

export interface TerraAthleteResponse {
  athlete: Athlete;
  status: string;
  type: string;
  user: TerraUser;
}

export function GetAthlete(
  devId: string,
  apiKey: string,
  userId: string,
  toWebhook: boolean = true
): Promise<TerraAthleteResponse> {
  var requestOptions = {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "dev-id": devId,
      "Content-Type": "application/json",
    },
  };

  return new Promise<TerraAthleteResponse>((res, rej) => {
    fetch(
      `https://api.tryterra.co/v2/athlete?user_id=${userId}&to_webhook=${toWebhook}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => res(result as TerraAthleteResponse))
      .catch((error) => rej(error as TerraError));
  });
}
