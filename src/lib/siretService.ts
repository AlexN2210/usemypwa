// Service pour la validation SIRET avec l'API gouvernementale française
export interface SiretValidationResult {
  valid: boolean;
  company?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    activity: string;
    apeCode?: string; // Code APE (Activité Principale Exercée) - ex: "62.02Z"
    phone?: string; // Numéro de téléphone (si disponible)
  };
  error?: string;
}

export class SiretService {
  // Utilisation de la fonction Edge Function Supabase (une fois déployée)
  // Fallback vers API directe si Edge Function non disponible
  private static readonly SUPABASE_FUNCTION_URL = 'https://neucmsawqhaglkuxsfag.supabase.co/functions/v1/siret';

  static validateSiretFormat(siret: string): boolean {
    const cleanSiret = siret.replace(/\s/g, '');
    return /^\d{14}$/.test(cleanSiret);
  }

  static async validateSiret(siret: string): Promise<SiretValidationResult> {
    if (!this.validateSiretFormat(siret)) {
      return { valid: false, error: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    const cleanSiret = siret.replace(/\s/g, '');

    // Utiliser directement l'API gouvernementale (la fonction Edge n'est pas encore déployée)
    // Si vous déployez la fonction Edge plus tard, vous pouvez réactiver l'essai ci-dessous
    try {
      // Essayer d'abord la fonction Supabase Edge Function (si disponible)
      return await this.validateWithSupabaseFunction(cleanSiret);
    } catch (error) {
      // Si la fonction Edge n'existe pas ou échoue, utiliser directement l'API gouvernementale
      console.log('🔍 Utilisation de l\'API gouvernementale française (recherche-entreprises.api.gouv.fr)');
      return await this.validateWithDirectAPI(cleanSiret);
    }
  }

  private static async validateWithSupabaseFunction(siret: string): Promise<SiretValidationResult> {
    const url = `${this.SUPABASE_FUNCTION_URL}?siret=${siret}`;
    
    console.log(`🔍 Recherche SIRET via Supabase Edge Function: ${siret}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Usemy-PWA/1.0'
        }
      });

      // Si la fonction n'existe pas (404) ou erreur réseau, on passe à l'API directe
      if (!response.ok) {
        if (response.status === 404) {
          // Fonction Edge n'existe pas, on passe à l'API directe
          throw new Error('Edge Function non disponible');
        }
        if (response.status === 429) {
          return { valid: false, error: 'Trop de requêtes, réessayez plus tard' };
        }
        throw new Error(`Erreur Supabase Function: ${response.status}`);
      }

      const data = await response.json();

      if (data.valid && data.company) {
        console.log(`✅ SIRET validé via Supabase: ${data.company.name}`);
        return data;
      }

      // Si pas de résultat, on passe à l'API directe
      throw new Error('Aucun résultat de la fonction Edge');
    } catch (error: any) {
      // Si erreur réseau ou fonction non disponible, on passe à l'API directe
      if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error('Fonction Edge non disponible');
      }
      throw error;
    }
  }
  
  private static async validateWithDirectAPI(siret: string): Promise<SiretValidationResult> {
    console.log(`🔍 Recherche SIRET via API gouvernementale directe: ${siret}`);
    
    // Utilisation d'un proxy CORS fonctionnel
    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${siret}`;
    const fullUrl = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    
    console.log(`🌐 URL complète: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Usemy-PWA/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404)
        return { valid: false, error: 'SIRET non trouvé dans les registres officiels' };
      if (response.status === 429)
        return { valid: false, error: 'Trop de requêtes, réessayez plus tard' };
      throw new Error(`Erreur API gouvernementale: ${response.status}`);
    }

    const data = await response.json();

    // Vérifier si la réponse contient des résultats
    if (data.results && data.results.length > 0) {
      const entreprise = data.results[0];
      const siege = entreprise.siege || {};

      console.log(`✅ SIRET validé via API gouvernementale: ${entreprise.nom_complet || entreprise.nom_raison_sociale}`);

      // Récupérer le code APE (Activité Principale Exercée)
      // Le code APE est généralement dans activite_principale sous forme "XX.XXZ"
      // Exemple: "62.02Z" pour "Programmation informatique"
      const apeCode = entreprise.activite_principale || undefined;
      
      // L'API Sirene ne fournit pas directement le numéro de téléphone
      // Mais on peut essayer de le récupérer depuis d'autres champs si disponibles
      const phone = siege.numero_telephone || 
                    entreprise.numero_telephone || 
                    undefined;

      return {
        valid: true,
        company: {
          name:
            entreprise.nom_complet ||
            entreprise.nom_raison_sociale ||
            'Nom non disponible',
          address: siege.adresse || 'Adresse non disponible',
          city: siege.libelle_commune || 'Ville non disponible',
          postalCode: siege.code_postal || 'Code postal non disponible',
          activity: entreprise.activite_principale || 'Activité non disponible',
          apeCode: apeCode, // Code APE (ex: "62.02Z")
          phone: phone // Sera undefined si non disponible
        }
      };
    }

    // Si aucun résultat, le SIRET n'existe pas dans les registres officiels
    console.log('⚠️ Aucun résultat pour ce SIRET dans l\'API gouvernementale');
    return { valid: false, error: 'SIRET non trouvé dans les registres officiels français' };
  }

  
}

