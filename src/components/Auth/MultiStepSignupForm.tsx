import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Stepper } from './Stepper';
import { ProfessionSelector } from './ProfessionSelector';
import { SiretValidator } from './SiretValidator';
import { SiretValidationResult } from '../../lib/siretService';
import { User, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

interface MultiStepSignupFormProps {
  onToggleMode: () => void;
}

interface FormData {
  // Étape 1
  fullName: string;
  email: string;
  password: string;
  
  // Étape 2
  userType: 'professional' | 'individual';
  
  // Étape 3 (si professionnel)
  profession: string;
  
  // Étape 4 (si professionnel)
  siret: string;
  siretValid: boolean;
  companyName: string;
}

const STEPS = [
  'Informations',
  'Type de compte',
  'Profession',
  'Vérification'
];

export function MultiStepSignupForm({ onToggleMode }: MultiStepSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    userType: 'individual',
    profession: '',
    siret: '',
    siretValid: false,
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.userType);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.password.length >= 6;
      case 2:
        return formData.userType !== '';
      case 3:
        return formData.userType === 'individual' || formData.profession !== '';
      case 4:
        return formData.userType === 'individual' || formData.siretValid;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData({ userType: 'individual' })}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                    formData.userType === 'individual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`w-6 h-6 ${formData.userType === 'individual' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`font-medium text-sm ${formData.userType === 'individual' ? 'text-blue-700' : 'text-gray-600'}`}>
                    Particulier
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData({ userType: 'professional' })}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                    formData.userType === 'professional'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 ${formData.userType === 'professional' ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span className={`font-medium text-sm ${formData.userType === 'professional' ? 'text-pink-700' : 'text-gray-600'}`}>
                    Professionnel
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        if (formData.userType === 'individual') {
          return (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Compte Particulier</h3>
              <p className="text-gray-600">
                Vous pouvez maintenant accéder à l'application et découvrir des professionnels près de chez vous.
              </p>
            </div>
          );
        }
        return (
          <ProfessionSelector
            selectedProfession={formData.profession}
            onProfessionChange={(profession) => updateFormData({ profession })}
          />
        );

      case 4:
        if (formData.userType === 'individual') {
          return (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Prêt à commencer !</h3>
              <p className="text-gray-600">
                Votre compte particulier est prêt. Cliquez sur "Créer mon compte" pour finaliser.
              </p>
            </div>
          );
        }
        return (
          <SiretValidator
            siret={formData.siret}
            onSiretChange={(siret) => updateFormData({ siret })}
            onValidationResult={(result) => updateFormData({ 
              siretValid: result.valid,
              companyName: result.company?.name || ''
            })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <img src="/logoheader.png" alt="Usemy Logo" className="w-16 h-16" />
      </div>

      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Inscription</h2>
      <p className="text-center text-gray-600 mb-8">Rejoignez la communauté Usemy</p>

      {/* Stepper */}
      <div className="mb-6">
        <Stepper 
          currentStep={currentStep} 
          totalSteps={STEPS.length} 
          steps={STEPS} 
        />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Contenu de l'étape */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
              className="w-full py-3 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: 'linear-gradient(to right, #FF00FF, #FF33CC)'
              }}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Déjà inscrit ?{' '}
          <button
            onClick={onToggleMode}
            className="text-pink-500 font-semibold hover:text-pink-600 transition"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
