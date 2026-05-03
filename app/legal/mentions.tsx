import LegalPage from '@/components/LegalPage';

const SECTIONS = [
  {
    title: '1. Éditeur de l\'application',
    content:
      'Nom ou raison sociale : [À COMPLÉTER — Nom Prénom ou Nom de la société]\n' +
      'Forme juridique : [Auto-entrepreneur / SARL / SAS / etc.]\n' +
      'Adresse : [À COMPLÉTER — Adresse complète]\n' +
      'Numéro de SIRET : [À COMPLÉTER]\n' +
      'Adresse e-mail : [À COMPLÉTER — contact@metaboost.fr]\n' +
      'Téléphone : [À COMPLÉTER]\n\n' +
      'Directeur de la publication : [À COMPLÉTER — Nom Prénom]',
  },
  {
    title: '2. Hébergement',
    content:
      'L\'application MetaBoost est hébergée par :\n\n' +
      'Vercel Inc.\n' +
      '340 Pine Street, Suite 701\n' +
      'San Francisco, California 94104\n' +
      'États-Unis\n' +
      'Site web : https://vercel.com\n\n' +
      'La base de données est gérée par :\n\n' +
      'Supabase Inc.\n' +
      '970 Toa Payoh North, #07-04\n' +
      'Singapour 318992\n' +
      'Site web : https://supabase.com',
  },
  {
    title: '3. Propriété intellectuelle',
    content:
      'L\'ensemble des éléments constituant l\'application MetaBoost (textes, graphismes, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses) est la propriété exclusive de l\'éditeur ou fait l\'objet d\'une licence d\'utilisation.\n\n' +
      'Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments de l\'application, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de l\'éditeur.\n\n' +
      'Toute exploitation non autorisée de l\'application ou de l\'un quelconque des éléments qu\'elle contient est considérée comme constitutive d\'une contrefaçon et passible de poursuites judiciaires conformément aux dispositions des articles L.335-2 et suivants du Code de la Propriété Intellectuelle.',
  },
  {
    title: '4. Responsabilité',
    content:
      'L\'éditeur s\'efforce d\'assurer au mieux de ses possibilités l\'exactitude et la mise à jour des informations diffusées sur cette application, dont il se réserve le droit de corriger, à tout moment et sans préavis, le contenu.\n\n' +
      'Toutefois, l\'éditeur ne peut garantir l\'exactitude, la précision ou l\'exhaustivité des informations mises à disposition sur cette application. En conséquence, l\'éditeur décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur cette application.',
  },
  {
    title: '5. Liens hypertextes',
    content:
      'L\'application MetaBoost peut contenir des liens hypertextes vers d\'autres sites ou applications. L\'éditeur n\'exerce aucun contrôle sur ces sites et n\'assume aucune responsabilité quant à leur contenu.',
  },
  {
    title: '6. Droit applicable',
    content:
      'Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.\n\n' +
      'Conformément à la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l\'Économie Numérique (LCEN).',
  },
  {
    title: '7. Contact',
    content:
      'Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à :\n[À COMPLÉTER — contact@metaboost.fr]',
  },
];

export default function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions légales"
      subtitle="LCEN — Loi n° 2004-575 du 21 juin 2004"
      lastUpdated="Mai 2025"
      sections={SECTIONS}
    />
  );
}
