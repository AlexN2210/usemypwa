import { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { SiretService, SiretValidationResult } from '../../lib/siretService';

interface SiretValidatorProps {
  siret: string;
  onSiretChange: (siret: string) => void;
  onValidationResult: (result: SiretValidationResult) => void;
}

export function SiretValidator({ siret, onSiretChange, onValidationResult }: SiretValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<SiretValidationResult | null>(null);

  const handleSiretChange = (value: string) => {
    // Nettoyer le SIRET (supprimer les espaces)
    const cleanSiret = value.replace(/\s/g, '');
    onSiretChange(cleanSiret);
    
    // Réinitialiser la validation
    setValidationResult(null);
  };

  const validateSiret = async () => {
    if (!siret || siret.length !== 14) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await SiretService.validateSiret(siret);
      setValidationResult(result);
      onValidationResult(result);
    } catch (error) {
      const errorResult: SiretValidationResult = {
        valid: false,
        error: 'Erreur lors de la validation'
      };
      setValidationResult(errorResult);
      onValidationResult(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  const formatSiret = (value: string) => {
    // Formater le SIRET avec des espaces pour la lisibilité
    const cleanValue = value.replace(/\s/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro SIRET
        </label>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Votre numéro SIRET permet de vérifier votre entreprise et d'augmenter votre crédibilité
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={formatSiret(siret)}
            onChange={(e) => handleSiretChange(e.target.value)}
            placeholder="123 456 789 01234"
            maxLength={17} // 14 chiffres + 3 espaces
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={validateSiret}
            disabled={isValidating || siret.length !== 14}
            className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {isValidating ? (
              <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
            ) : (
              'Vérifier'
            )}
          </button>
        </div>

        {/* Résultat de la validation */}
        {validationResult && (
          <div className={`p-4 rounded-lg border ${
            validationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${
                validationResult.valid ? 'text-green-700' : 'text-red-700'
              }`}>
                {validationResult.valid ? 'SIRET validé' : 'SIRET invalide'}
              </span>
            </div>
            
            {validationResult.valid && validationResult.company && (
              <div className="mt-3 space-y-1 text-sm text-green-600">
                <div><strong>Entreprise :</strong> {validationResult.company.name}</div>
                <div><strong>Adresse :</strong> {validationResult.company.address}</div>
                <div><strong>Ville :</strong> {validationResult.company.city} {validationResult.company.postalCode}</div>
                <div><strong>Activité :</strong> {validationResult.company.activity}</div>
              </div>
            )}
            
            {!validationResult.valid && validationResult.error && (
              <div className="mt-2 text-sm text-red-600">
                {validationResult.error}
              </div>
            )}
          </div>
        )}

        {/* Aide pour le SIRET */}
        <div className="text-xs text-gray-500">
          <p>Le SIRET est un numéro à 14 chiffres qui identifie votre établissement.</p>
          <p>Vous le trouvez sur vos documents officiels (K-bis, factures, etc.)</p>
        </div>
      </div>
    </div>
  );
}
