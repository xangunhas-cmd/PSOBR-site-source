import {Shell} from '@/components/Portal';
import NewsFeed from '@/components/NewsFeed';
import {getNews} from '@/lib/community-data';

export default async function Page(){const news=await getNews();return <Shell tag="PSO BRASIL / NOTÍCIAS" title="Notícias" description="Títulos, comunicados e grandes transferências.">
  <div className="feed-rule"><span>Publicação automática</span><strong>Transferências com overall 84+ viram notícia.</strong><small>O overall e a imagem vêm do catálogo oficial de cartas.</small></div>
  <NewsFeed items={news}/>
</Shell>}
