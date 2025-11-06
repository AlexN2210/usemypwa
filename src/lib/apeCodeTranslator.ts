// Service pour traduire les codes APE en noms d'activités
// Le code APE est basé sur la nomenclature NAF (Nomenclature d'Activités Française)

// Mapping des codes APE les plus courants vers leurs activités
// Ce mapping peut être étendu avec plus de codes selon les besoins
export const APE_CODE_MAPPING: Record<string, string> = {
  // Agriculture
  '01.11Z': 'Culture de céréales',
  '01.12Z': 'Culture de légumes',
  '01.13Z': 'Culture de fruits',
  
  // Industrie alimentaire
  '10.11Z': 'Transformation et conservation de la viande',
  '10.12Z': 'Transformation et conservation de volaille',
  '10.13Z': 'Préparation de produits à base de viande',
  '10.20Z': 'Transformation et conservation de poisson',
  '10.31Z': 'Transformation et conservation de pommes de terre',
  '10.41Z': 'Fabrication d\'huiles et graisses végétales',
  '10.51Z': 'Fabrication de produits laitiers',
  '10.61Z': 'Meunerie',
  '10.71Z': 'Fabrication de pain et de pâtisserie',
  '10.81Z': 'Fabrication de sucre',
  '10.82Z': 'Fabrication de cacao, chocolat et de confiseries',
  '10.91Z': 'Fabrication de préparations alimentaires',
  '11.02A': 'Fabrication de vins effervescents',
  '11.02B': 'Fabrication de vins de qualité',
  '11.03Z': 'Fabrication de cidre et de vins de fruits',
  '11.04Z': 'Fabrication d\'autres boissons fermentées',
  '11.05Z': 'Fabrication de bière',
  '11.06Z': 'Fabrication de malt',
  '11.07Z': 'Fabrication de boissons rafraîchissantes',
  
  // Commerce
  '46.11Z': 'Intermédiaires du commerce en matières premières agricoles',
  '46.12Z': 'Intermédiaires du commerce en animaux vivants',
  '46.13Z': 'Intermédiaires du commerce en matières premières textiles',
  '46.14Z': 'Intermédiaires du commerce en combustibles',
  '46.15Z': 'Intermédiaires du commerce en métaux et minerais',
  '46.16Z': 'Intermédiaires du commerce en produits chimiques',
  '46.17Z': 'Intermédiaires du commerce en bois et matériaux de construction',
  '46.18Z': 'Intermédiaires du commerce en machines et équipements',
  '46.19Z': 'Intermédiaires du commerce en biens divers',
  '46.21Z': 'Commerce de gros de céréales et de tabac non manufacturé',
  '46.22Z': 'Commerce de gros de fleurs et plantes',
  '46.23Z': 'Commerce de gros d\'animaux vivants',
  '46.31Z': 'Commerce de gros de fruits et légumes',
  '46.32Z': 'Commerce de gros de viandes de boucherie',
  '46.33Z': 'Commerce de gros de produits laitiers',
  '46.34Z': 'Commerce de gros de boissons',
  '46.35Z': 'Commerce de gros de produits à base de tabac',
  '46.41Z': 'Commerce de gros de textiles',
  '46.42Z': 'Commerce de gros d\'habillement et de chaussures',
  '46.43Z': 'Commerce de gros d\'appareils électroménagers',
  '46.44Z': 'Commerce de gros de vaisselle et verrerie',
  '46.45Z': 'Commerce de gros de parfumerie et de produits de beauté',
  '46.46Z': 'Commerce de gros de produits pharmaceutiques',
  '46.47Z': 'Commerce de gros de meubles et tapis',
  '46.48Z': 'Commerce de gros d\'articles d\'horlogerie et de bijouterie',
  '46.49Z': 'Commerce de gros d\'autres biens domestiques',
  '46.51Z': 'Commerce de gros d\'ordinateurs et d\'équipements informatiques',
  '46.52Z': 'Commerce de gros de composants électroniques',
  '46.61Z': 'Commerce de gros de matériel agricole',
  '46.62Z': 'Commerce de gros de machines-outils',
  '46.63Z': 'Commerce de gros de machines pour l\'extraction et la construction',
  '46.64Z': 'Commerce de gros de machines pour l\'industrie textile',
  '46.65Z': 'Commerce de gros de mobilier de bureau',
  '46.66Z': 'Commerce de gros d\'autres machines et équipements',
  '46.69Z': 'Commerce de gros non spécialisé',
  '46.71Z': 'Commerce de gros de combustibles et de produits annexes',
  '46.72Z': 'Commerce de gros de minerais et métaux',
  '46.73Z': 'Commerce de gros de bois et de matériaux de construction',
  '46.74Z': 'Commerce de gros de quincaillerie et fournitures pour plomberie',
  '46.75Z': 'Commerce de gros de produits chimiques',
  '46.76Z': 'Commerce de gros d\'autres produits intermédiaires',
  '46.77Z': 'Commerce de gros de déchets et débris',
  '46.90Z': 'Commerce non spécialisé',
  '47.11Z': 'Commerce de détail en magasin non spécialisé à prédominance alimentaire',
  '47.19Z': 'Autre commerce de détail en magasin non spécialisé',
  '47.21Z': 'Commerce de détail de fruits et légumes en magasin spécialisé',
  '47.22Z': 'Commerce de détail de viandes et de produits à base de viande en magasin spécialisé',
  '47.23Z': 'Commerce de détail de poissons et fruits de mer en magasin spécialisé',
  '47.24Z': 'Commerce de détail de pain et de pâtisserie en magasin spécialisé',
  '47.25Z': 'Commerce de détail de boissons en magasin spécialisé',
  '47.26Z': 'Commerce de détail de produits à base de tabac en magasin spécialisé',
  '47.29Z': 'Autre commerce de détail alimentaire sur éventaires et marchés',
  '47.30Z': 'Commerce de détail de carburants en magasin spécialisé',
  '47.41Z': 'Commerce de détail d\'ordinateurs et d\'équipements périphériques en magasin spécialisé',
  '47.42Z': 'Commerce de détail de matériels de télécommunication en magasin spécialisé',
  '47.43Z': 'Commerce de détail de matériels audio et vidéo en magasin spécialisé',
  '47.51Z': 'Commerce de détail de textiles en magasin spécialisé',
  '47.52Z': 'Commerce de détail de quincaillerie et peintures en magasin spécialisé',
  '47.53Z': 'Commerce de détail de tapis et moquettes en magasin spécialisé',
  '47.54Z': 'Commerce de détail d\'appareils électroménagers en magasin spécialisé',
  '47.59Z': 'Commerce de détail de meubles et équipements du foyer en magasin spécialisé',
  '47.61Z': 'Commerce de détail de livres en magasin spécialisé',
  '47.62Z': 'Commerce de détail de journaux et papeterie en magasin spécialisé',
  '47.63Z': 'Commerce de détail d\'enregistrements musicaux et vidéo en magasin spécialisé',
  '47.64Z': 'Commerce de détail d\'articles de sport en magasin spécialisé',
  '47.65Z': 'Commerce de détail de jeux et jouets en magasin spécialisé',
  '47.71Z': 'Commerce de détail d\'habillement en magasin spécialisé',
  '47.72Z': 'Commerce de détail de chaussures et d\'articles en cuir en magasin spécialisé',
  '47.73Z': 'Commerce de détail de produits pharmaceutiques en magasin spécialisé',
  '47.74Z': 'Commerce de détail d\'articles médicaux et orthopédiques en magasin spécialisé',
  '47.75Z': 'Commerce de détail de parfumerie et de produits de beauté en magasin spécialisé',
  '47.76Z': 'Commerce de détail de fleurs et plantes en magasin spécialisé',
  '47.77Z': 'Commerce de détail d\'articles d\'horlogerie et de bijouterie en magasin spécialisé',
  '47.78Z': 'Commerce de détail d\'équipements automobiles en magasin spécialisé',
  '47.79Z': 'Commerce de détail d\'autres biens en magasin spécialisé',
  '47.81Z': 'Commerce de détail alimentaire sur éventaires et marchés',
  '47.82Z': 'Commerce de détail de textiles, d\'habillement et de chaussures sur éventaires et marchés',
  '47.89Z': 'Autre commerce de détail sur éventaires et marchés',
  '47.91Z': 'Commerce de détail via internet',
  '47.99Z': 'Autre commerce de détail hors magasin',
  
  // Services
  '55.10Z': 'Hôtels et hébergement similaire',
  '55.20Z': 'Hébergement touristique et autre hébergement de courte durée',
  '55.30Z': 'Terrains de camping et parcs pour caravanes',
  '55.90Z': 'Autres hébergements',
  '56.10A': 'Restauration traditionnelle',
  '56.10B': 'Cafétérias et autres libres-services',
  '56.10C': 'Restauration de type rapide',
  '56.21Z': 'Services des traiteurs',
  '56.29A': 'Restauration collective sous contrat',
  '56.29B': 'Autres services de restauration',
  '56.30Z': 'Débits de boissons',
  
  // Activités informatiques
  '62.01Z': 'Programmation informatique',
  '62.02Z': 'Conseil informatique',
  '62.03Z': 'Gestion d\'installations informatiques',
  '62.09Z': 'Autres activités informatiques',
  
  // Activités de services administratifs
  '82.11Z': 'Services administratifs combinés de bureau',
  '82.19Z': 'Photocopie et autres activités spécialisées de soutien de bureau',
  '82.20Z': 'Activités de centres d\'appels',
  '82.30Z': 'Organisation de salons professionnels et congrès',
  '82.91Z': 'Activités des agences de recrutement',
  '82.92Z': 'Activités des agences de travail temporaire',
  '82.99Z': 'Autres activités de soutien aux entreprises',
  
  // Activités immobilières
  '68.10Z': 'Agences immobilières',
  '68.20A': 'Location de logements',
  '68.20B': 'Location de terrains et d\'autres biens immobiliers',
  '68.31Z': 'Administration d\'immeubles et autres biens immobiliers',
  '68.32A': 'Marchands de biens immobiliers',
  '68.32B': 'Promoteurs immobiliers',
  
  // Activités juridiques et comptables
  '69.10Z': 'Activités juridiques',
  '69.20Z': 'Activités comptables',
  
  // Activités d\'architecture et d\'ingénierie
  '71.11Z': 'Activités d\'architecture',
  '71.12Z': 'Activités d\'ingénierie',
  '71.20A': 'Activités de contrôle technique automobile',
  '71.20B': 'Autres activités de contrôle et d\'analyses techniques',
  
  // Activités de recherche-développement
  '72.11Z': 'Recherche-développement en biotechnologie',
  '72.19Z': 'Recherche-développement en autres sciences physiques et naturelles',
  '72.20Z': 'Recherche-développement en sciences humaines et sociales',
  
  // Publicité et études de marché
  '73.11Z': 'Activités des agences de publicité',
  '73.12Z': 'Régie publicitaire de médias',
  '73.20Z': 'Études de marché et sondages',
  
  // Activités photographiques
  '74.20Z': 'Activités photographiques',
  
  // Activités de design
  '74.10Z': 'Activités spécialisées de design',
  
  // Autres activités spécialisées
  '74.30Z': 'Traduction et interprétation',
  '74.90A': 'Activités des agences de presse',
  '74.90B': 'Autre activités spécialisées',
  
  // Activités vétérinaires
  '75.00Z': 'Activités vétérinaires',
  
  // Activités de nettoyage
  '81.10Z': 'Activités combinées de soutien lié aux bâtiments',
  '81.21Z': 'Nettoyage courant des bâtiments',
  '81.22Z': 'Autres activités de nettoyage des bâtiments',
  '81.29A': 'Désinfection et désinsectisation',
  '81.29B': 'Autres activités de nettoyage',
  '81.30Z': 'Services d\'aménagement paysager',
  
  // Services administratifs
  '85.10Z': 'Enseignement pré-primaire',
  '85.20Z': 'Enseignement primaire',
  '85.31Z': 'Enseignement secondaire général',
  '85.32Z': 'Enseignement secondaire technique ou professionnel',
  '85.41Z': 'Enseignement post-secondaire non supérieur',
  '85.42Z': 'Enseignement supérieur',
  '85.51Z': 'Enseignement de disciplines sportives et d\'activités de loisirs',
  '85.52Z': 'Enseignement culturel',
  '85.53Z': 'Enseignement de la conduite',
  '85.59A': 'Formation continue des adultes',
  '85.59B': 'Autres enseignements',
  '85.60Z': 'Activités de soutien à l\'enseignement',
  
  // Activités pour la santé humaine
  '86.10Z': 'Activités des médecins généralistes',
  '86.21Z': 'Activités des médecins spécialistes',
  '86.22Z': 'Activités des médecins dentistes',
  '86.23Z': 'Activités des autres professions médicales',
  '86.90A': 'Ambulances',
  '86.90B': 'Autres activités pour la santé humaine',
  
  // Hébergement médico-social
  '87.10Z': 'Hébergement médicalisé',
  '87.20Z': 'Hébergement social pour personnes handicapées mentales',
  '87.30Z': 'Hébergement social pour personnes handicapées physiques',
  '87.90A': 'Hébergement social pour enfants en difficultés',
  '87.90B': 'Autre hébergement social',
  
  // Action sociale
  '88.10Z': 'Action sociale sans hébergement pour personnes âgées',
  '88.20Z': 'Action sociale sans hébergement pour personnes handicapées',
  '88.30Z': 'Action sociale sans hébergement pour enfants et jeunes handicapés',
  '88.91A': 'Accueil de jeunes enfants',
  '88.91B': 'Accueil d\'enfants handicapés',
  '88.99A': 'Autre action sociale sans hébergement pour jeunes enfants',
  '88.99B': 'Autre action sociale sans hébergement',
  
  // Activités récréatives
  '90.01Z': 'Arts du spectacle vivant',
  '90.02Z': 'Activités de soutien au spectacle vivant',
  '90.03Z': 'Création artistique',
  '90.04Z': 'Gestion de salles de spectacles',
  
  // Activités sportives
  '93.11Z': 'Gestion d\'installations sportives',
  '93.12Z': 'Activités de clubs de sports',
  '93.13Z': 'Activités des centres de culture physique',
  '93.19Z': 'Autres activités sportives',
  '93.21Z': 'Activités des parcs d\'attractions et parcs à thèmes',
  '93.29Z': 'Autres activités récréatives et de loisirs',
  
  // Activités associatives
  '94.11Z': 'Activités des organisations patronales',
  '94.12Z': 'Activités des organisations professionnelles',
  '94.20Z': 'Activités des syndicats de salariés',
  '94.91Z': 'Activités des organisations religieuses',
  '94.92Z': 'Activités des organisations politiques',
  '94.99Z': 'Autres organisations fonctionnant par adhésion volontaire',
  
  // Réparation
  '95.11Z': 'Réparation d\'ordinateurs et d\'équipements périphériques',
  '95.12Z': 'Réparation d\'équipements de communication',
  '95.21Z': 'Réparation de produits électroniques grand public',
  '95.22Z': 'Réparation d\'appareils électroménagers',
  '95.23Z': 'Réparation de chaussures et d\'articles en cuir',
  '95.24Z': 'Réparation de meubles et d\'équipements du foyer',
  '95.25Z': 'Réparation d\'articles d\'horlogerie et de bijouterie',
  '95.29Z': 'Réparation d\'autres biens personnels et domestiques',
  
  // Services personnels
  '96.01A': 'Blanchisserie-teinturerie de gros',
  '96.01B': 'Blanchisserie-teinturerie de détail',
  '96.02Z': 'Coiffure et soins de beauté',
  '96.03Z': 'Services funéraires',
  '96.04Z': 'Entretien corporel',
  '96.09Z': 'Autres services personnels',
};

/**
 * Traduit un code APE en nom d'activité
 * @param apeCode - Le code APE (ex: "11.02A", "62.02Z")
 * @returns Le nom de l'activité ou le code APE si non trouvé
 */
export function translateApeCode(apeCode: string | undefined | null): string {
  if (!apeCode || apeCode.trim() === '') {
    return '';
  }

  // Nettoyer le code APE (supprimer les espaces)
  const cleanCode = apeCode.trim().replace(/\s/g, '');
  
  // Chercher dans le mapping
  const activity = APE_CODE_MAPPING[cleanCode];
  
  if (activity) {
    return activity;
  }
  
  // Si non trouvé, retourner le code APE avec une indication
  return cleanCode;
}

/**
 * Formate l'affichage du code APE avec sa traduction
 * @param apeCode - Le code APE
 * @returns Le nom de l'activité traduite, ou le code APE si non trouvé
 */
export function formatApeCodeDisplay(apeCode: string | undefined | null): string {
  if (!apeCode || apeCode.trim() === '') {
    return '';
  }

  const cleanCode = apeCode.trim().replace(/\s/g, '');
  const activity = translateApeCode(cleanCode);
  
  // Retourner uniquement l'activité traduite, pas le code
  if (activity && activity !== cleanCode) {
    return activity;
  }
  
  // Si non trouvé, retourner le code APE (cas rare)
  return cleanCode;
}

