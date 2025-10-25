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
  
  // Simulation de l'API INSEE pour le développement
  private static async mockSiretValidation(siret: string): Promise<{
    valid: boolean;
    company?: any;
    error?: string;
  }> {
    // Simulation d'un délai API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulation de différents cas
    if (siret === '12345678901234') {
      return {
        valid: true,
        company: {
          name: 'Entreprise Test',
          address: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          activity: 'Services informatiques'
        }
      };
    } else if (siret.startsWith('123')) {
      return {
        valid: true,
        company: {
          name: 'Société ' + siret.substring(0, 6),
          address: 'Adresse ' + siret.substring(6, 10),
          city: 'Paris',
          postalCode: '75001',
          activity: 'Services professionnels'
        }
      };
    } else {
      return {
        valid: false,
        error: 'SIRET non trouvé dans la base de données'
      };
    }
  }
  
  // En production, utilisez cette méthode avec la vraie API INSEE
  static async validateSiretWithRealAPI(siret: string): Promise<SiretValidationResult> {
    try {
      // Note: En production, vous devrez :
      // 1. Obtenir un token d'accès INSEE
      // 2. Faire une requête à l'API réelle
      // 3. Gérer les erreurs et les limites de taux
      
      const response = await fetch(`${this.API_BASE_URL}/siret/${siret}`, {
        headers: {
          'Authorization': 'Bearer YOUR_INSEE_TOKEN',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return {
          valid: false,
          error: 'SIRET non trouvé'
        };
      }
      
      const data = await response.json();
      
      return {
        valid: true,
        company: {
          name: data.etablissement.uniteLegale.denominationUniteLegale,
          address: data.etablissement.adresseEtablissement.numeroVoieEtablissement + 
                   ' ' + data.etablissement.adresseEtablissement.typeVoieEtablissement + 
                   ' ' + data.etablissement.adresseEtablissement.libelleVoieEtablissement,
          city: data.etablissement.adresseEtablissement.libelleCommuneEtablissement,
          postalCode: data.etablissement.adresseEtablissement.codePostalEtablissement,
          activity: data.etablissement.uniteLegale.activitePrincipaleUniteLegale
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Erreur lors de la validation du SIRET'
      };
    }
  }
}

