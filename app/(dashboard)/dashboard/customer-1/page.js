import fs from 'fs';
import path from 'path';
import CustomerOneClient from './CustomerOneClient';

export default async function CustomerOnePage() {
  const dataPath = path.join(process.cwd(), 'Data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <CustomerOneClient data={data} />;
}
