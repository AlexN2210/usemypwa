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
  // API gouvernementale française pour la validation SIRET
  private static readonly API_BASE_URL = 'https://entreprise.api.gouv.fr/v2/etablissements';
  private static readonly API_TOKEN = 'YOUR_API_TOKEN_HERE';
  
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
      
      // Utiliser l'API gouvernementale française
      try {
        const result = await this.validateWithGovernmentAPI(cleanSiret);
        return result;
      } catch (apiError) {
        console.error('Erreur API gouvernementale:', apiError);
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
  
  // Validation avec l'API gouvernementale française
  private static async validateWithGovernmentAPI(siret: string): Promise<SiretValidationResult> {
    try {
      console.log('🔍 Recherche SIRET:', siret);
      console.log('🌐 URL API:', `${this.API_BASE_URL}/${siret}`);
      
      // Utiliser l'API publique sans authentification
      const response = await fetch(`${this.API_BASE_URL}/${siret}`, {
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
            error: 'SIRET non trouvé dans la base de données gouvernementale'
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
      
      if (data.etablissement) {
        const etablissement = data.etablissement;
        const uniteLegale = etablissement.unite_legale;
        const adresse = etablissement.adresse;
        
        return {
          valid: true,
          company: {
            name: uniteLegale.denomination || uniteLegale.nom || uniteLegale.prenom || 'Nom non disponible',
            address: `${adresse.numero_voie || ''} ${adresse.type_voie || ''} ${adresse.libelle_voie || ''}`.trim(),
            city: adresse.libelle_commune || 'Ville non disponible',
            postalCode: adresse.code_postal || 'Code postal non disponible',
            activity: uniteLegale.activite_principale || 'Activité non disponible'
          }
        };
      } else {
        return {
          valid: false,
          error: 'Données d\'entreprise non disponibles'
        };
      }
    } catch (error) {
      throw new Error(`Erreur API gouvernementale: ${error}`);
    }
  }
  
}

