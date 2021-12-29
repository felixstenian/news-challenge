import { NextApiResponse } from 'next';

export default async (_, res: NextApiResponse) => {
  // Exit the current user from "Preview Mode". This function accepts no args.
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
};
