import fs from 'fs';
import path from 'path';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  const dataPath = path.join(process.cwd(), 'data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <CustomersClient data={data} />;
}
