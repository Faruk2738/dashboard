import fs from 'fs';
import path from 'path';
import SalesClient from './SalesClient';

export default async function SalesPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <SalesClient data={data} />;
}
