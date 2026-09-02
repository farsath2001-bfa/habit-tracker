import habitLogo from '../../assets/habit-logo.png';

/**
 * App logomark - the brand image. Rendered as a plain <img> (not inline
 * SVG) specifically because the old hand-drawn SVG logo used a hardcoded
 * gradient id shared across every mounted instance (sidebar + mobile top
 * bar + mobile drawer all render a <Logo> at once); some mobile browsers
 * fail to paint a gradient whose source lives inside a currently
 * display:none sibling, which made the logo disappear on mobile only.
 * A plain image has no such id-collision class of bug.
 */
export default function Logo({ size = 36, rounded = 'rounded-xl', className = '' }) {
  return (
    <img
      src={habitLogo}
      alt="Habit Tracker logo"
      width={size}
      height={size}
      className={`block shrink-0 object-cover shadow-sm ${rounded} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}