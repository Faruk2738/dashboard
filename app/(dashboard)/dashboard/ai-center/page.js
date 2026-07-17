import fs from 'fs';
import path from 'path';
import AiCenterClient from './AiCenterClient';

export default async function AiCenterPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <AiCenterClient data={data} />;
}
