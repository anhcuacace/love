const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="border-t border-line/15 bg-paper/80 backdrop-blur-sm">
      <div className="container-responsive flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted md:flex-row">
        <span>Làm bằng tình yêu vô hạn · {currentYear}</span>
        <span className="text-xs uppercase tracking-[0.2em]">
          Our Love Story
        </span>
      </div>
    </footer>
  );
};
