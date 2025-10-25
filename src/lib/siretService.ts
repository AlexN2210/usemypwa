// Service pour la validation SIRET avec l'API gouvernementale française
export interface SiretValidationResult {
  valid: boolean;
  company?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    activity: string;
  };
  error?: string;
}

export class SiretService {
  // Utilisation de la fonction Edge Function Supabase (une fois déployée)
  // Fallback vers simulation locale si Edge Function non disponible
  // TODO: Remplacer par votre vraie URL Supabase
  private static readonly SUPABASE_FUNCTION_URL = 'https://your-project-ref.supabase.co/functions/v1/siret';

  static validateSiretFormat(siret: string): boolean {
    const cleanSiret = siret.replace(/\s/g, '');
    return /^\d{14}$/.test(cleanSiret);
  }

  static async validateSiret(siret: string): Promise<SiretValidationResult> {
    if (!this.validateSiretFormat(siret)) {
      return { valid: false, error: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    const cleanSiret = siret.replace(/\s/g, '');

    try {
      // Essayer d'abord la fonction Supabase Edge Function
      return await this.validateWithSupabaseFunction(cleanSiret);
    } catch (error) {
      console.warn('Fonction Supabase non disponible, utilisation de l\'API directe:', error);
      // Fallback vers API gouvernementale directe
      return await this.validateWithDirectAPI(cleanSiret);
    }
  }

  private static async validateWithSupabaseFunction(siret: string): Promise<SiretValidationResult> {
    const url = `${this.SUPABASE_FUNCTION_URL}?siret=${siret}`;
    
    console.log(`🔍 Recherche SIRET via Supabase Edge Function: ${siret}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Usemy-PWA/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404)
        return { valid: false, error: 'SIRET non trouvé dans la base de données' };
      if (response.status === 429)
        return { valid: false, error: 'Trop de requêtes, réessayez plus tard' };
      throw new Error(`Erreur Supabase Function: ${response.status}`);
    }

    const data = await response.json();

    if (data.valid && data.company) {
      console.log(`✅ SIRET validé via Supabase: ${data.company.name}`);
      return data;
    }

    return { valid: false, error: data.error || 'SIRET non trouvé dans la base de données' };
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
        return { valid: false, error: 'SIRET non trouvé dans la base de données' };
      if (response.status === 429)
        return { valid: false, error: 'Trop de requêtes, réessayez plus tard' };
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const entreprise = data.results[0];
      const siege = entreprise.siege || {};

      console.log(`✅ SIRET validé via API gouvernementale: ${entreprise.nom_complet || entreprise.nom_raison_sociale}`);

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
          activity: entreprise.activite_principale || 'Activité non disponible'
        }
      };
    }

    return { valid: false, error: 'SIRET non trouvé dans la base de données' };
  }

  
}

