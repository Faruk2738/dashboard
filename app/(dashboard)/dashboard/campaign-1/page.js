import fs from 'fs';
import path from 'path';
import CampaignOneClient from './CampaignGalleryClient';

export default async function CampaignOnePage() {
  const dataPath = path.join(process.cwd(), 'Data', 'aggregated.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <CampaignOneClient data={data} />;
}
