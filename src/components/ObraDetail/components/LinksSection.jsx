import { ExternalLink } from 'lucide-react';

/**
 * LinksSection - Links display (v3.0)
 * Displays all links with array format
 */
function LinksSection({ obra }) {
  // Check if section should be displayed at all
  const hasLinks = Array.isArray(obra.links) && obra.links.length > 0;

  if (!hasLinks) return null;

  return (
    <section className="detail-section">
      <h3>Links</h3>
      <div className="links">
        {obra.links.map((link, index) => (
          <div key={index} className={`link-item ${link.principal ? 'principal-link' : ''}`}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <span>{link.nome}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LinksSection;
