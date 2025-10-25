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
  // API de recherche d'entreprises (accessible via CORS)
  private static readonly API_BASE_URL = 'https://recherche-entreprises.api.gouv.fr/search';
  
  // Validation basique du format SIRET
  static validateSiretFormat(siret: string): boolean {
    // SIRET doit contenir 14 chiffres
    const cleanSiret = siret.replace(/\s/g, '');
    return /^\d{14}$/.test(cleanSiret);
  }
  
  // Validation avec l'API INSEE officielle
  static async validateSiret(siret: string): Promise<SiretValidationResult> {
    try {
      // Validation du format
      if (!this.validateSiretFormat(siret)) {
        return {
          valid: false,
          error: 'Le SIRET doit contenir exactement 14 chiffres'
        };
      }
      
      const cleanSiret = siret.replace(/\s/g, '');
      
      // Utiliser l'API de recherche d'entreprises
      try {
        const result = await this.validateWithSearchAPI(cleanSiret);
        return result;
      } catch (apiError) {
        console.error('Erreur API de recherche:', apiError);
        return {
          valid: false,
          error: 'Service de validation SIRET temporairement indisponible'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Erreur lors de la validation du SIRET'
      };
    }
  }
  
  // Validation avec l'API de recherche d'entreprises
  private static async validateWithSearchAPI(siret: string): Promise<SiretValidationResult> {
    try {
      console.log('🔍 Recherche SIRET:', siret);
      
      // Construire l'URL de recherche avec le SIRET
      const url = `${this.API_BASE_URL}?q=${siret}`;
      console.log('🌐 URL API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Statut de la réponse:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            valid: false,
            error: 'SIRET non trouvé dans la base de données'
          };
        }
        if (response.status === 429) {
          return {
            valid: false,
            error: 'Trop de requêtes. Veuillez réessayer dans quelques instants'
          };
        }
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Données reçues:', data);
      
      // Vérifier si des résultats ont été trouvés
      if (data.results && data.results.length > 0) {
        const entreprise = data.results[0];
        
        return {
          valid: true,
          company: {
            name: entreprise.nom_raison_sociale || 'Nom non disponible',
            address: entreprise.adresse || 'Adresse non disponible',
            city: entreprise.ville || 'Ville non disponible',
            postalCode: entreprise.code_postal || 'Code postal non disponible',
            activity: entreprise.activite_principale || 'Activité non disponible'
          }
        };
      } else {
        return {
          valid: false,
          error: 'SIRET non trouvé dans la base de données'
        };
      }
    } catch (error) {
      throw new Error(`Erreur API de recherche: ${error}`);
    }
  }
  
}

