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
  private static readonly API_BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3';
  
  // Validation basique du format SIRET
  static validateSiretFormat(siret: string): boolean {
    // SIRET doit contenir 14 chiffres
    const cleanSiret = siret.replace(/\s/g, '');
    return /^\d{14}$/.test(cleanSiret);
  }
  
  // Validation avec l'API INSEE (simulation pour le développement)
  static async validateSiret(siret: string): Promise<SiretValidationResult> {
    try {
      // Validation du format
      if (!this.validateSiretFormat(siret)) {
        return {
          valid: false,
          error: 'Le SIRET doit contenir exactement 14 chiffres'
        };
      }
      
      // Simulation de l'API INSEE (en production, vous devrez utiliser la vraie API)
      // Pour le développement, on simule une validation
      const cleanSiret = siret.replace(/\s/g, '');
      
      // Simulation d'une réponse API
      const mockResponse = await this.mockSiretValidation(cleanSiret);
      
      if (mockResponse.valid) {
        return {
          valid: true,
          company: mockResponse.company
        };
      } else {
        return {
          valid: false,
          error: mockResponse.error
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Erreur lors de la validation du SIRET'
      };
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
