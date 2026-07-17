import fs from 'fs';
import path from 'path';
import RfmClient from './RfmClient';

export default async function RfmPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <RfmClient data={data} />;
}
