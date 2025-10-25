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
  // Utilisation d'un proxy CORS public pour contourner les restrictions
  private static readonly PROXY_URL = 'https://api.allorigins.win/raw?url=';
  private static readonly API_BASE_URL = 'https://recherche-entreprises.api.gouv.fr/search';

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
      return await this.validateWithProxyAPI(cleanSiret);
    } catch (error) {
      console.error('Erreur API de recherche:', error);
      return {
        valid: false,
        error: 'Service de validation SIRET temporairement indisponible'
      };
    }
  }
  
  private static async validateWithProxyAPI(siret: string): Promise<SiretValidationResult> {
    // Utilisation d'un proxy CORS pour contourner les restrictions
    const encodedUrl = encodeURIComponent(`${this.API_BASE_URL}?q=${siret}`);
    const proxyUrl = `${this.PROXY_URL}${encodedUrl}`;
    
    console.log(`🔍 Recherche SIRET via proxy: ${siret}`);
    
    const response = await fetch(proxyUrl, {
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

      console.log(`✅ SIRET validé: ${entreprise.nom_complet || entreprise.nom_raison_sociale}`);

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

