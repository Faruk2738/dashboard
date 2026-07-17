import fs from 'fs';
import path from 'path';
import ForecastingClient from './ForecastingClient';

export default async function ForecastingPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <ForecastingClient data={data} />;
}
