/**
 * YokanriLogo — componente de marca reutilizável.
 *
 * Variants:
 *   'icon'     — ícone quadrado com gradiente e "Yo" branco
 *   'wordmark' — texto "Yokanri" com "Yo" em gradiente
 *   'lockup'   — ícone + wordmark lado a lado (padrão)
 *
 * O gradiente usa --accent-grad-from / --accent-grad-to,
 * portanto responde automaticamente ao tema de cor ativo.
 */
export default function YokanriLogo({
  variant  = 'lockup',
  size     = 32,
  gap      = null,
  className = '',
  style     = {},
}) {
  const radius      = Math.round(size * 0.225);
  const iconFont    = Math.round(size * 0.41);
  const wordFont    = Math.round(size * 0.72);
  const gapVal      = gap ?? Math.round(size * 0.38);

  const iconStyle = {
    width:          size,
    height:         size,
    minWidth:       size,
    borderRadius:   radius,
    background:     'linear-gradient(145deg, var(--accent-grad-icon-from, #2dd4bf), var(--accent-grad-icon-to, #7c5cff))',
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  };

  const iconTextStyle = {
    fontWeight:    800,
    fontSize:      iconFont,
    letterSpacing: '-0.04em',
    color:         '#fff',
    lineHeight:    1,
    userSelect:    'none',
  };

  const wordmarkStyle = {
    fontWeight:    700,
    fontSize:      wordFont,
    letterSpacing: '-0.04em',
    color:         'var(--text-primary)',
    lineHeight:    1,
    userSelect:    'none',
  };

  const yoStyle = {
    background:              'linear-gradient(120deg, var(--accent-grad-from, #2dd4bf), var(--accent-grad-to, #7c5cff))',
    WebkitBackgroundClip:    'text',
    backgroundClip:          'text',
    WebkitTextFillColor:     'transparent',
  };

  const Icon = (
    <span style={iconStyle} aria-hidden="true">
      <span style={iconTextStyle}>Yo</span>
    </span>
  );

  const Wordmark = (
    <span style={wordmarkStyle}>
      <span style={yoStyle}>Yo</span>kanri
    </span>
  );

  if (variant === 'icon') {
    return <span className={className} style={style}>{Icon}</span>;
  }

  if (variant === 'wordmark') {
    return <span className={className} style={style}>{Wordmark}</span>;
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: gapVal, ...style }}
    >
      {Icon}
      {Wordmark}
    </span>
  );
}
