/**
 * Cover image component with loading state.
 * Accepts optional children (e.g. NSFW reveal overlay button).
 *
 * @param {string|null} coverUrl     - The cover image URL
 * @param {string}      altText      - Alt text for the image
 * @param {string}      className    - CSS class for the container div
 * @param {string}      imgClassName - CSS class for the img element
 * @param {ReactNode}   children     - Optional overlay elements (e.g. nsfw-reveal-btn)
 */
function CoverImage({ coverUrl, altText, className = '', imgClassName = '', children }) {
  return (
    <div className={className}>
      {coverUrl
        ? <img src={coverUrl} alt={altText} className={imgClassName} />
        : <div className="no-cover" />
      }
      {children}
    </div>
  );
}

export default CoverImage;
