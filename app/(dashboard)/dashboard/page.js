import fs from 'fs';
import path from 'path';
import OverviewClient from './OverviewClient';

export default async function OverviewPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <OverviewClient data={data} />;
}
