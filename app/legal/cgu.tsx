import LegalPage from '@/components/LegalPage';

const SECTIONS = [
  {
    title: '1. Objet',
    content:
      'Les présentes Conditions Générales d\'Utilisation (CGU) ont pour objet de définir les modalités et conditions d\'utilisation de l\'application mobile et web MetaBoost, ainsi que les droits et obligations des parties.\n\n' +
      'En accédant à l\'application et en créant un compte, vous acceptez sans réserve les présentes CGU. Si vous n\'acceptez pas ces conditions, vous devez cesser d\'utiliser l\'application.',
  },
  {
    title: '2. Description du service',
    content:
      'MetaBoost est une application de suivi de transformation physique permettant à ses utilisateurs de :\n\n' +
      '• Suivre leur morphologie via un avatar personnalisé\n' +
      '• Enregistrer leurs mesures corporelles (poids, tour de ventre, cuisse, bras)\n' +
      '• Accéder à des programmes d\'entraînement personnalisés\n' +
      '• Suivre leur nutrition via l\'analyse de repas\n' +
      '• Monitorer leur activité physique (pas, séances)\n' +
      '• Visualiser leur progression dans le temps\n\n' +
      'L\'application est disponible via un navigateur web à l\'adresse metaboost-five.vercel.app.',
  },
  {
    title: '3. Accès au service',
    content:
      'L\'accès à MetaBoost est réservé aux personnes âgées de 16 ans ou plus. En dessous de cet âge, l\'accord d\'un représentant légal est requis.\n\n' +
      'L\'utilisation de l\'application nécessite une connexion internet. L\'éditeur ne saurait être tenu responsable d\'une impossibilité d\'accès au service liée à un dysfonctionnement du réseau.\n\n' +
      'L\'éditeur se réserve le droit de suspendre ou d\'interrompre l\'accès au service pour des raisons de maintenance, d\'amélioration ou en cas de force majeure.',
  },
  {
    title: '4. Création de compte',
    content:
      'L\'utilisation complète de MetaBoost peut nécessiter la création d\'un compte via :\n' +
      '• L\'authentification Google (OAuth 2.0)\n' +
      '• Une inscription manuelle avec prénom et données corporelles\n\n' +
      'L\'utilisateur s\'engage à fournir des informations exactes et à les maintenir à jour. L\'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion.',
  },
  {
    title: '5. Obligations de l\'utilisateur',
    content:
      'En utilisant MetaBoost, vous vous engagez à :\n\n' +
      '• Ne pas utiliser l\'application à des fins illicites ou contraires aux présentes CGU\n' +
      '• Ne pas tenter de contourner les mesures de sécurité\n' +
      '• Ne pas reproduire, copier ou exploiter commercialement tout ou partie du service\n' +
      '• Ne pas usurper l\'identité d\'un autre utilisateur\n' +
      '• Respecter les droits de propriété intellectuelle de l\'éditeur\n\n' +
      'MetaBoost est un outil de suivi. Les informations fournies ne constituent en aucun cas un avis médical. Consultez un professionnel de santé avant d\'entreprendre tout programme alimentaire ou sportif.',
  },
  {
    title: '6. Données de santé',
    content:
      'MetaBoost collecte des données de santé au sens du Règlement Général sur la Protection des Données (RGPD, Art. 9), notamment : poids corporel, mensurations (ventre, cuisse, bras), taille.\n\n' +
      'Ces données sont traitées sur la base de votre consentement explicite, librement donné lors de votre inscription. Vous pouvez retirer ce consentement à tout moment en supprimant votre compte ou vos données via l\'application.\n\n' +
      'MetaBoost ne partage jamais vos données de santé avec des tiers à des fins commerciales.',
  },
  {
    title: '7. Propriété intellectuelle',
    content:
      'L\'ensemble du contenu de l\'application MetaBoost (code source, design, textes, icônes, algorithmes, avatars) est protégé par le droit de la propriété intellectuelle.\n\n' +
      'Toute reproduction ou utilisation sans autorisation écrite préalable de l\'éditeur est interdite et passible de sanctions pénales.',
  },
  {
    title: '8. Limitation de responsabilité',
    content:
      'MetaBoost est fourni "en l\'état". L\'éditeur ne garantit pas que le service sera exempt d\'erreurs ou d\'interruptions.\n\n' +
      'L\'éditeur ne saurait être tenu responsable :\n' +
      '• Des dommages indirects résultant de l\'utilisation de l\'application\n' +
      '• Des pertes de données dues à un dysfonctionnement technique\n' +
      '• Des décisions prises par l\'utilisateur sur la base des informations fournies par l\'application\n\n' +
      'Les conseils de l\'application ne remplacent pas l\'avis d\'un médecin, d\'un nutritionniste ou d\'un coach sportif professionnel.',
  },
  {
    title: '9. Modification des CGU',
    content:
      'L\'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par notification dans l\'application ou par e-mail.\n\n' +
      'La poursuite de l\'utilisation de l\'application après notification vaut acceptation des nouvelles CGU.',
  },
  {
    title: '10. Résiliation',
    content:
      'L\'utilisateur peut supprimer son compte à tout moment via la section "Profil" de l\'application. La suppression du compte entraîne l\'effacement définitif de toutes les données personnelles dans un délai de 30 jours.\n\n' +
      'L\'éditeur peut suspendre ou supprimer un compte en cas de violation des présentes CGU, sans préavis ni indemnité.',
  },
  {
    title: '11. Droit applicable et juridiction',
    content:
      'Les présentes CGU sont soumises au droit français.\n\n' +
      'En cas de litige, et à défaut de résolution amiable, les tribunaux compétents du ressort du siège de l\'éditeur seront seuls compétents.\n\n' +
      'Conformément au Code de la consommation, vous pouvez également recourir à une procédure de médiation. Plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr',
  },
  {
    title: '12. Contact',
    content: 'Pour toute question relative aux présentes CGU :\n[À COMPLÉTER — contact@metaboost.fr]',
  },
];

export default function CGU() {
  return (
    <LegalPage
      title="Conditions Générales d'Utilisation"
      subtitle="Version en vigueur — Mai 2025"
      lastUpdated="Mai 2025"
      sections={SECTIONS}
    />
  );
}
