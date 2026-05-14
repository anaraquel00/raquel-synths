export interface LoreBlock {
  type: 'text' | 'ad'; // Diz se é texto ou anúncio
  content?: string;    // O HTML do texto (só se for type 'text')
}

export interface LoreEpisode {

  id: string;          // O ID do documento (s1-e1) vêm automático
  title: string;
  title_en?: string;   // Opcional (?) pq pode não ter em todos ainda

  category: string;    // Antes era 'seasonTitle'
  category_en?: string;

  content: string;     // O HTML puro
  content_en?: string;

  description?: string; // Para SEO ou cards
  description_en?: string;

  image: string;       // Antes era 'coverImage'

  mode: 'broklin' | 'jonah';
  published: boolean;
  releaseDate?: string;
}



// 🇧🇷 --- DADOS EM PORTUGUÊS ---
export const BROKLIN_ARC_PT: LoreEpisode[] = [];
// 🇺🇸 --- ENGLISH DATA (TRANSLATED & EXPANDED) ---
export const BROKLIN_ARC_EN: LoreEpisode[] = [];

// ☢️ --- ARCO JONAH (PT) ---
export const JONAH_ARC_PT: LoreEpisode[] = [];


