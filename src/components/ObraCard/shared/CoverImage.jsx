/**
 * Cover image component with loading state
 * @param {string|null} coverUrl - The cover image URL
 * @param {string} altText - Alt text for the image
 * @param {string} className - CSS class for the container
 * @param {string} imgClassName - CSS class for the image
 */
function CoverImage({ coverUrl, altText, className = '', imgClassName = '' }) {
  if (coverUrl) {
    return (
      <div className={className}>
        <img src={coverUrl} alt={altText} className={imgClassName} />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="no-cover"></div>
    </div>
  );
}

export default CoverImage;
