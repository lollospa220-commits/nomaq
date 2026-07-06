export default function NomaqLogo({ isDarkBackground }: { isDarkBackground?: boolean }) {
  // -translate-x-4 (−16px) sull'img: centra OTTICAMENTE la parola "Nomaq", che
  // le stelline a sinistra spingono ~16px a destra del centro geometrico.
  return (
    <div className="flex items-center justify-center py-3.5">
      <img
        src="/images/logo.png"
        alt="Nomaq Logo"
        className={`h-16 w-auto object-contain -translate-x-4 ${isDarkBackground ? 'brightness-0 invert' : ''}`}
        loading="eager"
      />
    </div>
  );
}
