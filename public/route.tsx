import { NextRequest, NextResponse } from "next/server";

type History = {
  id: number;
  shorted_url: string;
  real_url: string;
  clicks: number;
  date: number;
};

const initial_data: History[] = [
  {
    id: 1,
    shorted_url: "https://rdr.me/123456",
    clicks: 11,
    date: Date.now(),
    real_url: "https://google.com",
  },
  {
    id: 2,
    shorted_url: "https://rdr.me/456721",
    clicks: 0,
    date: Date.now(),
    real_url: "https://asdfdasf.cvom",
  },
  {
    id: 3,
    shorted_url: "https://rdr.me/564132",
    clicks: 11,
    date: Date.now(),
    real_url:
      "https://dfgklndfasgklmdasflds/dasmnklmfakldasF?lkgmndfklgmdflg=123dasfşmasdfdas",
  },
  {
    id: 4,
    shorted_url: "https://rdr.me/654132",
    clicks: 11,
    date: Date.now(),
    real_url: "https://google.com",
  },
  {
    id: 5,
    shorted_url: "https://rdr.me/123456",
    clicks: 11,
    date: Date.now(),
    real_url: "https://gooom",
  },
  {
    id: 6,
    shorted_url: "https://rdr.me/68432514",
    clicks: 15952626261,
    date: Date.now(),
    real_url: "https://gooasdfasdfgle.com",
  },
  {
    id: 7,
    shorted_url: "https://rdr.me/123",
    clicks: 11,
    date: Date.now(),
    real_url: "",
  },
  {
    id: 8,
    shorted_url: "https://rdr.me/768465",
    clicks: 1684654654561,
    date: Date.now(),
    real_url:
      "https://googsd98f4ds8gdfs68g4dfs68g4d5s6fg4df568g468dfs1g4dfs68g468dfsg468dsfg4sd6f54dsle.comgoogsd98f4ds8gdfs68g4dfs68g4d5s6fg4df568g468dfs1g4dfs68g468dfsg468dsfg4sd6f54dsle.comgoogsd98f4ds8gdfs68g4dfs68g4d5s6fg4df568g468dfs1g4dfs68g468dfsg468dsfg4sd6f54dsle.com",
  },
  {
    id: 9,
    shorted_url: "https://rdr.me/123456",
    clicks: 0,
    date: Date.now(),
    real_url: "",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = initial_data.find((x) => x.id.toString() === id);
  return NextResponse.json({ data }, { status: 200 });
}
