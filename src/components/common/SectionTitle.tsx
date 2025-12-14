import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export const SectionTitle = ({ title, subtitle, eyebrow }: SectionTitleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center rounded-full border border-line/15 bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl font-semibold md:text-3xl">
        <span className="relative inline-block">
          <span aria-hidden="true" className="absolute -bottom-1 left-0 right-0 h-3 rotate-[-1deg] rounded-full bg-accent-soft" />
          <span className="relative">{title}</span>
        </span>
      </h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
    </motion.div>
  );
};
