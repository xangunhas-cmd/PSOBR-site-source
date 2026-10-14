import {Shell} from '@/components/Portal';
import MuseumArchive from '@/components/MuseumArchive';

export default function Page(){
  return <Shell
    tag="PSO BRASIL / HISTÓRIA"
    title="Museu"
    description="Campeões, elencos e títulos da Seleção."
  >
    <MuseumArchive/>
  </Shell>;
}
